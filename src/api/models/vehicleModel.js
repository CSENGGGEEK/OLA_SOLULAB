const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
        driver: { 
            type: String, 
            required: true,
            default:null
        },
        make: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        color: {
            type: String,
            default: 'Unknown'
        },
        mileage: {
            type: Number,
            default: 0
        },
        vin: {
            type: String,
            unique: true,
            required: true
        },
        capacity: {
            type: Number,
            required: true,
            max: 10
        }
    },
    {
        timestamps: true
    }
);




const Vehicle = mongoose.model('vehicle', vehicleSchema);



// Method to create a new vehicle
vehicleSchema.statics.createVehicle = async function(vehicleData) {
    try {
        
        const newVehicle = new this(vehicleData);
        
        
        return await newVehicle.save();
    } catch (error) {
        
        if (error.code === 11000) { 
            throw new Error('Vehicle with this VIN already exists.');
        }
        throw new Error('An error occurred while creating the vehicle: ' + error.message);
    }
};


module.exports = Vehicle;