const express = require('express');
const VehicleModel = require('../../models/vehicleModel');
const UserModel = require('../../models/userModel');
const {adminAuthorize} = require('../../middleware/authMiddleware');

vehicleRouter = express.Router()

vehicleRouter.post('/create',adminAuthorize,async (req,res)=>{
    try {
        const data = req.body;

        if (!make || !model || !year || !vin || !capacity) {
            return res.status(400).json({ message: 'Make, model, year, VIN, and capacity are required fields.' });
        }

        if (capacity > 10) {
            return res.status(400).json({ message: 'Capacity cannot exceed 10.' });
        }

        const newVehicle = new VehicleModel({
            driver: data.driver || null,
            make:data.model,
            model:data.model,
            year:data.year,
            color: data.color || 'Unknown',
            mileage: data.mileage || 0,
            vin:data.vin,
            capacity:data.capacity,
        });

        await newVehicle.save();

        res.status(201).json({ message: 'Vehicle created successfully.', vehicle: savedVehicle });

    } catch (error) {
        
    }
});

vehicleRouter.post('/assign-driver', adminAuthorize, async (req, res) => {
    try {
        const { vin, driverUsername } = req.body;


        if (!vin || !driverUsername) {
            return res.status(400).json({ message: 'VIN and Driver Username are required' });
        }

        const vehicle = await VehicleModel.findOne({ vin });
        if (!vehicle) {
            return res.status(404).json({ message: 'No vehicle found with the provided VIN' });
        }

        
        const driver = await UserModel.model.findOne({ username: driverUsername });
        if (!driver) {
            return res.status(404).json({ message: 'No driver found with the provided username' });
        }

        const assignedVehicle = await VehicleModel.findOne({ driver: driver._id });
        if (assignedVehicle) {
            return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
        }

        
        vehicle.driver = driver._id;
        const updatedVehicle = await vehicle.save();

        
        res.status(200).json({ message: 'Driver assigned successfully', vehicle: updatedVehicle });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'An error occurred while assigning the driver', error: error.message });
    }
});




vehicleRouter.delete('/delete-vehicle',adminAuthorize,async (req,res)=>{

    try {
        
        const data = req.body;

        if (!data.vin) {
            return res.status(400).json({"InsufficientFields":"VIN number is required"})
        }

        await VehicleModel.deleteOne({'vin':data.vin});

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No vehicle found with the provided VIN' });
        }

        return res.status(200).json({"Deleted":"The vehicle was success fully deleted"})
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while deleting the vehicle', error: error.message });

    }
});



module.exports = vehicleRouter;