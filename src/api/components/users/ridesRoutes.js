const express = require('express');
const { customerAuthorize } = require('../../middleware/authMiddleware');
const RideModel = require('../../models/ridesModel');

ridesRouter = express.Router()

ridesRouter.post('/book', customerAuthorize, async (req, res) => {
    try {
        const data = req.body;
        const result = await RideModel.createRide(req.user.username, data.startLocation, data.endLocation, data.capacity);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ type: error.type || 'InternalError', message: error.message || 'An error occurred' });
    }
});


ridesRouter.post('/cancel', customerAuthorize, async (req, res) => {
    try {
        const data = req.body;

        if (!data.rideId) {
            return res.status(400).json({ type: 'BadRequest', message: 'Ride ID is required' });
        }

        const ride = await RideModel.model.findById(data.rideId).exec();

        if (!ride) {
            return res.status(404).json({ type: 'NotFound', message: 'Ride not found' });
        }

        if (ride.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ type: 'Forbidden', message: 'You are not authorized to cancel this ride' });
        }

        ride.status = 'Cancelled'; 
        ride.endTime = new Date(); 
        await ride.save();

        await UserModel.updateDriverAvailability(ride.driver, true); 

        res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
        res.status(500).json({ type: error.type || 'InternalError', message: error.message || 'An error occurred' });
    }
});

module.exports = ridesRouter;