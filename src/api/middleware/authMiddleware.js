const jwt = require('jsonwebtoken');
const Config = require('../config/config');

const authorize = async (req, res, next) => {
    const token = req.session.data;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    try {
        const decoded = jwt.verify(token, Config.jwtSecretKey);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

const roleAuthorize = (role) => {
    return async (req, res, next) => {
        authorize(req, res, () => {
            if (req.user && req.user.username && req.user.role === role) {
                next();
            } else {
                return res.status(403).json({ message: 'Forbidden' });
            }
        });
    };
};

module.exports = {
    customerAuthorize: roleAuthorize('customer'),
    superadminAuthorize: roleAuthorize('superadmin'),
    adminAuthorize: roleAuthorize('admin'),
    driverAuthorize: roleAuthorize('driver')
};
