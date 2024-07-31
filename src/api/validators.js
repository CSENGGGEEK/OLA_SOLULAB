const Joi = require('joi');

const userSchemaValidator = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().min(8).max(16).required(),
    repeatPassword: Joi.ref('password'),
    firstName: Joi.string().min(3).max(30).required(),
    middleName: Joi.string().allow(''), // Allow empty string if middle name is not provided
    lastName: Joi.string().allow(''), // Allow empty string if last name is not provided
    role: Joi.string().valid('customer', 'admin', 'superadmin', 'driver').required(),
    phone: Joi.string().pattern(/^\d{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be a 10-digit number.'
    }),
    location: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    isAvailable: Joi.boolean()
});

const ridesSchemaValidator = Joi.object({
    driver: Joi.string().alphanum().required(), 
    customer: Joi.string().alphanum().required(), 
    startLocation: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    endLocation: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso(),
    fare: Joi.number().positive().required(),
    status: Joi.string().valid('pending', 'active', 'completed', 'cancelled').required(),
    rating: Joi.number().min(1).max(5),
    feedback: Joi.string().allow('')
});


const vehicleSchemaValidator = Joi.object({
    make: Joi.string().valid('Toyota','Ford','')
})

module.exports = {userSchemaValidator,ridesSchemaValidator};