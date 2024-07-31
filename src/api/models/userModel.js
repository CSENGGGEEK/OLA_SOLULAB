const mongoose = require('mongoose');
const { userSchemaValidator } = require('../validators');
const bcrypt = require('bcrypt');
const Config = require('../config/config');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must be unique']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'driver', 'superadmin'],
        default: 'customer',
    },
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
    ,
    relatedUsers:{
        type:[mongoose.Types.ObjectId]
    }
    ,
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiration: {
        type: Date,
    },
});

const User = mongoose.model('users', userSchema);


class UserModel {

    constructor(){
        this.model = User;
    }

    async createUser(username, email, password, repeatPassword, firstName, middleName, lastName, role, phone, location) {
        try {
            const userObj = {
                username: username,
                email: email,
                password: password,
                repeatPassword: repeatPassword,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                role: role,
                phone: phone,
                location: location,
                isAvailable: true
            }

            await userSchemaValidator.validateAsync(userObj);

            const saltRounds = 10;
            const plainTextPassword = userObj.password;

            userObj.password = (await bcrypt.hash(plainTextPassword, saltRounds)).toString();

            const model = new User(userObj);
            model.save()
            delete userObj.repeatPassword,userObj.location, userObj.password;
            return userObj;

        } catch (error) {
            if (error.code === 11000) {
                return { type: 'DuplicateKeyError', message: 'Username or email already exists' };
            }
            return { type: error.name || 'ValidationError', message: error.message || 'An error occurred' };
        }
    }

    async validateUser(username, password) {
        try {
            const userObj = await User.findOne({ username: username });

            if (!userObj) {
                return { success: false, message: "User does not exist" };
            }

            const isValidPassword = await bcrypt.compare(password, userObj.password);

            if (isValidPassword) {
                return { success: true, message: "Authentication successful", user: userObj };
            } else {
                return { success: false, message: "Invalid password" };
            }
        } catch (error) {
            return { success: false, message: error.message || 'An error occurred' };
        }
    }

    async getDrivers(startLocation) {
        try {
            // Fetching customer Start Location
            const customerStartLocation = await Config.geocoder.reverse({
                lat: startLocation.latitude,
                lon: startLocation.longitude
            });
    

            // Looking for drivers in Redis
            const driverKeys = await Config.redisInstance.keys('user:*');
    

            // Map driver keys to an array of promises
            const driverPromises = driverKeys.map(async (key) => {
                
                // Get driver Location object from Redis using keys
                const driverLocationData = await Config.redisInstance.get(key);
                if (!driverLocationData) return null;
    
                
                // Parse the location object fron redis value
                const driverLocation = JSON.parse(driverLocationData);
                if (!driverLocation || !driverLocation.location.latitude || !driverLocation.location.longitude) return null;
    
        
                // Fetching driver Location
                const driverStartLocation = await Config.geocoder.reverse({
                    lat: driverLocation.location.latitude,
                    lon: driverLocation.location.longitude
                });
    
                // Compare zip codes
                if (driverStartLocation.zipcode === customerStartLocation.zipcode) {
                    return key;
                }
                return null;
            });
    
            // Wait for all promises to resolve and filter out null values
            const driversAvailable = (await Promise.all(driverPromises)).filter(key => key !== null);
    
            return driversAvailable;
        } catch (error) {
            console.error('Error retrieving drivers:', error);
        }
    }
}



module.exports = new UserModel();
