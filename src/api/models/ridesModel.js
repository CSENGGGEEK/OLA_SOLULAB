const mongoose = require('mongoose');
const { ridesSchemaValidator } = require('../validators');
const UserModel = require('./userModel');

const ridesSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startLocation: {
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
    endLocation: {
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
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    fare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String
    }
}, {
    timestamps: true 
});

const Rides = mongoose.model('rides', userSchema);

class RidesModel{

    async createRide(customer, startLocation, endLocation,capacity) {
        try {
            // Retrieve available drivers based on the start location
            const driversAvailable = await UserModel.getDrivers(startLocation,capacity);
    
            if (driversAvailable.length === 0) {
                
                return { type: 'NoDriversAvailableError', message: 'No drivers available at the moment.' };
            }
    
            
            const selectedDriver = driversAvailable[0];
    
            // Define the ride object
            const rideObj = {
                customer: customer,
                startLocation: startLocation,
                endLocation: endLocation,
                driver: selectedDriver._id,  
                startTime: new Date(),       
                endTime: null,               
                fare: 0,                     
            };
    
            // Validate the ride object (uncomment when you have a validator)
            await ridesSchemaValidator.validateAsync(rideObj);
    
            // Save the ride record in the database
            const model = new Rides(rideObj);
            await model.save();
    
            // Update the selected driver's availability
            await UserModel.updateDriverAvailability(selectedDriver._id, false); // Assuming `false` means unavailable
    
            return rideObj;
    
        } catch (error) {
            if (error.code === 11000) {
                return { type: 'DuplicateKeyError', message: 'Duplicate key error.' };
            }
            return { type: error.name || 'ValidationError', message: error.message || 'An error occurred' };
        }
    }
    
}

module.exports = new RidesModel();