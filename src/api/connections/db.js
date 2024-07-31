const {errorLogger,infoLogger} = require('../../logs/logger');
const { mongoose, mongo } = require('mongoose');
/*
*   @name : Database
*   @type : Class
*   @description : Stores all the database related intormation and methods.
*   @author : ANant Chitranshi
*/

class Database {
  constructor() {
    this.db = null;
    this.url = 'mongodb://localhost:27017/ola-solulab';
  }

  async connect() {
    if (!this.db) {
      mongoose.connect(this.url);
      this.db = mongoose.connection; 
      infoLogger.log({'level':'info','message':'Connected to MongoDB'})
    }
    
    this.db.on('connected', () => {
      infoLogger.info('Mongoose connection open to master DB');
    });
    
    this.db.on('error', (err) => {
      errorLogger.log(`Mongoose connection error for master DB: ${err}`);
    });
    
    this.db.on('disconnected', () => {
      errorLogger.log('Mongoose connection disconnected for master DB');
    });
    
    this.db.on('reconnected', () => {
      infoLogger.info('Mongoose connection reconnected for master DB');
    });
    return this.db;
  }

  
  
}

module.exports = new Database;