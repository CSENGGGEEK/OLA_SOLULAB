const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
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
        }
    },
    {
        timestamps: true
    }
);

const Vehicle = mongoose.model('vehicle',vehicleSchema);

class VehicleModel{
    constructor(){
        this.model = Vehicle;
    }

    async createVehicle(vehicleObj){
        
    }
}
