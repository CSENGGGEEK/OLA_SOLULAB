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

    async createRide(customer,startLocation,endLocation){
        try {

            
            

            const driversAvailable = UserModel.getDrivers(startLocation);
            
            const rideObj = {
                customer: customer,
                startLocation: startLocation,
                endLocation: endLocation,
                startTime: startTime,
                endTime: endTime,
                fare: fare,
            };

            // await ridesSchemaValidator.validateAsync(rideObj);
            // const model = new Rides(rideObj);
            // model.save()

            // return rideObj;

        } catch (error) {
            if (error.code === 11000) {
                return { type: 'DuplicateKeyError', message: '' };
            }
            return { type: error.name || 'ValidationError', message: error.message || 'An error occurred' };
        }
    }
}

module.exports = new RidesModel();