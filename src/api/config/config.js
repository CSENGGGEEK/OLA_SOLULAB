const {errorLogger, infoLogger} = require('../../logs/logger');
const dotenv = require('dotenv');
const NodeGeocoder = require('node-geocoder');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

dotenv.config()

/*
*   @name : Config
*   @type : Class
*   @description : Stores all the configuration related information.
*   @version: 1.0.0
*   @appName: OLA Clone
*   @env: development
*   @port: 3000
*   @infoLogFilePath: src/logs/infoLogs.log
*   @errorLogFilePath: src/logs/errorLogs.log
*   @author : Anant Chitranshi
*/

class Config {
    constructor() {
        
        // Server Configuration
        this.serverPort = 3000;
        this.env = 'development';
        
        // API Configuration
        this.apiVersion = 'v1'
        this.apiBasePath = 'api'

        
        // Logging Configuration
        this.logLevel = 'info';
        this.infoLogFilePath = 'src/logs/infoLogs.log';
        this.errorLogFilePath = 'src/logs/errorLogs.log'
        this.errorLogger = errorLogger
        this.infoLogger = infoLogger

        // Other Configurations
        this.appName = 'OLA Clone';
        this.appVersion = '1.0.0';

        // JWT Configurations
        this.jwtSecretKey = process.env.SECRET_KEY;
        this.expirationTime = '1d'
        
        // Node Geocoder API creds
        this.nodeGeocoderOptions = {
            provider: 'locationiq',
            apiKey: process.env.LOCATION_IQ_API_KEY, 
          };
        this.geocoder = NodeGeocoder(this.nodeGeocoderOptions);

        // Redis Configuration
        this.redisHost = 'localhost'
        this.redisPort = 6379
        this.redisInstance = null
        
        // Mail Transport configurations
        this.mailTransporter = nodemailer.createTransport(
            {
              host:'smtp.mailgun.org',
              port:587,
              auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
              }
            }
          );

        // Request limiter Configurations
        this.reqRateLimiter = rateLimit(
          {
            windowMs: 1 * 60 * 1000,
            max: 3, 
            standardHeaders: true,
            legacyHeaders: false,
            message:"Too many login attemps !!" 
          }
        )
        
    }

}

module.exports = new Config();