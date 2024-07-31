const express = require('express');
const {adminAuthorize} = require('../../middleware/authMiddleware');

vehicleRouter = express.Router()

vehicleRouter.post('/create',adminAuthorize,async (req,res)=>{
    try {
        const data = req.body;
        
    } catch (error) {
        
    }
})


module.exports = vehicleRouter;