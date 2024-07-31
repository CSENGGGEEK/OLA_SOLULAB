const express = require('express');
const { customerAuthorize } = require('../../middleware/authMiddleware');
const UserModel = require('../../models/userModel');

ridesRouter = express.Router()

// Route to handle booking
ridesRouter.post('/book',customerAuthorize,async (req,res)=>{
    try {
        const data = req.body;
        
        await UserModel.getDrivers(req.user.username,data.startLocation,data.endLocation);
    } catch (error) {
        
    }
})

module.exports = ridesRouter;