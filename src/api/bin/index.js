const http = require('http');
const expressApp = require('../app');
const Config = require('../config/config');
const Database = require('../connections/db');
const connectRedis = require('../redisService');


app = http.createServer(expressApp);

try {
    port = Config.serverPort;
    app.listen(port);
    Database.connect();
    connectRedis();
    Config.infoLogger.log({'message':`Server is running on ${port}`,'level':'info'});
} catch (error) {
    Config.errorLogger.log(error.name+error.message);
}