const express = require('express');
const UserModel = require('../../models/userModel');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Config = require('../../config/config');

authRouter = express.Router()

// Route to register User
authRouter.post('/register', async (req, res) => {
    try {
        const data = req.body;
        const result = await UserModel.createUser(
            data.username,
            data.email,
            data.password,
            data.repeatPassword,
            data.firstName,
            data.middleName,
            data.lastName,
            data.role,
            data.phone,
            data.location
        );

        if (result.success) {
            delete result.user.password; // Deleting password as it should not be sent in response
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ type: error.name, message: error.message });
    }
});

// Route to handle Login
authRouter.post('/login',Config.reqRateLimiter, async (req, res) => {
    try {
        const data = req.body;
        const result = await UserModel.validateUser(data.username, data.password);

        if (!result.success) {
            return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
        }

        const token = jwt.sign({ username: result.user.username, role: result.user.role }, Config.jwtSecretKey);

        req.session.data = token;

        if (result.user.role === 'driver') {
            const key = `user:${result.user.username}`
            await Config.redisInstance.set(key, JSON.stringify({
                'location': req.body.location,
            }))


        }

        delete result.user;

        res.json({ result, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to handle forgot password
authRouter.post('/forgot-password', async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            res.json({ 'InvalidData': "Invalid input" })
        }

        const user = await UserModel.model.findOne({ username: data.username });

        if (!user) {
            res.json({ 'UserNotFound': 'User does not exists' });
        }

        const resetToken = uuidv4();
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();

        const resetLink = `http://localhost:3000/api/v1/auth/reset-password/${resetToken}`;
        const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333;
                        font-size: 24px;
                        text-align: center;
                    }
                    p {
                        color: #555;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .reset-button {
                        display: inline-block;
                        background-color: #28a745;
                        color: #ffffff;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    footer {
                        text-align: center;
                        color: #aaa;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Password Reset Request</h1>
                    <p>Hi there!</p>
                    <p>You requested to reset your password. Please click the button below to create a new password:</p>
                    <a href="${resetLink}" class="reset-button">Reset Password</a>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <footer>
                        <p>Thank you,<br>OLAlabs Team</p>
                    </footer>
                </div>
            </body>
            </html>
            `;

        await Config.mailTransporter.sendMail({
            from: process.env.MAIL_USER,
            to: user.email,
            subject: '[RESET PASSWORD] Hello !! This is your password reset link from OLAlabs',
            html: emailHtml,

        })

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to handle otp verification
authRouter.post('/reset-password/:resetToken', async (req, res) => {
    try {
        const params = req.params;
        const data = req.body;

        if (!data.newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        const user = await UserModel.model.findOne({
            resetToken: params.resetToken,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }


        const saltRounds = 10;
        user.password = (await bcrypt.hash(data.newPassword, saltRounds)).toString();
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' })
    }
});

module.exports = authRouter;
