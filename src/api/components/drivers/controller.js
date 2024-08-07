const express = require('express');
const driverRouter = express.Router();
const RideModel = require('../../models/ridesModel');
const UserModel = require('../../models/userModel'); 
const {driverAuthorize} = require('../../middleware/authMiddleware'); 

driverRouter.post('/accept-ride', driverAuthorize,async (req, res) => {
    try {
        const { rideId, driverId } = req.body;

        if (!rideId || !driverId) {
            return res.status(400).json({ message: 'Ride ID and Driver ID are required' });
        }

        const ride = await RideModel.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== 'Pending') {
            return res.status(400).json({ message: 'Ride is not available for acceptance' });
        }

        ride.driver = driverId;
        ride.status = 'Accepted';
        const updatedRide = await ride.save();

        res.status(200).json({ message: 'Ride accepted successfully', ride: updatedRide });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while accepting the ride', error: error.message });
    }
});

driverRouter.post('/cancel-ride',driverAuthorize ,async (req, res) => {
    try {
        const { rideId, driverId } = req.body;

        if (!rideId || !driverId) {
            return res.status(400).json({ message: 'Ride ID and Driver ID are required' });
        }

        const ride = await RideModel.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.driver.toString() !== driverId) {
            return res.status(403).json({ message: 'You are not assigned to this ride' });
        }

        if (ride.status !== 'Accepted') {
            return res.status(400).json({ message: 'Ride is not accepted or already cancelled' });
        }

        ride.driver = null;
        ride.status = 'Cancelled';
        const updatedRide = await ride.save();

        res.status(200).json({ message: 'Ride cancelled successfully', ride: updatedRide });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while cancelling the ride', error: error.message });
    }
});

module.exports = driverRouter;
