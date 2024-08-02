const mongoose = require('mongoose');
const { ridesSchemaValidator } = require('../validators');
const UserModel = require('./userModel');
const VehicleModel = require('./vehicleModel');

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

const Rides = mongoose.model('rides', ridesSchema);

class RidesModel{

    constructor(){
        this.model = Rides;
    }

    async createRide(customer, startLocation, endLocation, capacity) {
        try {
            // Retrieve available drivers based on the start location
            const driversAvailable = await UserModel.getDrivers(startLocation);
    
            if (driversAvailable.length === 0) {
                return { type: 'NoDriversAvailableError', message: 'No drivers available at the moment.' };
            }
    
            let selectedDriver = null;
        
            for (const driverUsername of driversAvailable) {
                const username = driverUsername.slice(4);
                
        
                const currDriver = await UserModel.model.findOne({ username: username }).exec();
    
                if (!currDriver) {
                    continue; 
                }

                const vehicle = await VehicleModel.findOne({ driver: currDriver._id,capacity:capacity }).exec();
        
                if (vehicle) {
                    selectedDriver = currDriver;
                    break; 
                }
            }
    
            if (!selectedDriver) {
                return { type: 'NoAvailableVehicleError', message: 'No vehicle available for any driver.' };
            }
    
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
    
            // Validate the ride object
            await ridesSchemaValidator.validateAsync(rideObj);
    
            // Save the ride record in the database
            const model = new Rides(rideObj);
            await model.save();
    
            await UserModel.model.updateOne({_id: ObjectId(selectedDriver._id)}, {$set:{"isAvailable":false}}); 
    
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