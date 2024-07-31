const express = require('express');
const authRouter = require('../api/components/auth/controller');
const driverRouter = require('../api/components/users/driverRoutes');
const ridesRouter = require('../api/components/users/ridesRoutes');
const session = require('express-session');
const expressApp = express();

expressApp.use(session({
    secret: 'mypasswordisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true })); 



expressApp.use('/api/v1/auth',authRouter);
expressApp.use('/api/v1/driver',driverRouter);
expressApp.use('/api/v1/ride',ridesRouter);


module.exports = expressApp;