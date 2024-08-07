const {createClient} = require('redis');
const Config = require('./config/config');

const client = createClient({url:"redis://red-cqpjrojv2p9s73cdokc0:6379"});



const connectRedis = async ()=>{
    try {
        await client.connect();
        Config.redisInstance = client;
        Config.infoLogger.info({'level':'info','message':'Redis connection is setup successfully'})
    
    } catch (error) {
        Config.errorLogger.error({'level':'error','message':'Redis connection failed'})
    }
}

module.exports = connectRedis;