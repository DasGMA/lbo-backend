const jwt = require('jsonwebtoken');
const config = require('../config');
const secret = config.SECRET;
const tokenSecret = config.TOKEN_SECRET;
const refreshTokenSecret = config.REFRESH_TOKEN_SECRET;


const generateToken = (user) => {
    const payload = { user };
    const options = {
        expiresIn: '1h',
        jwtid: tokenSecret
    };

    return jwt.sign(payload, secret, options);
}

const refreshToken = (user) => {
    const payload = { id: user._id };
    const options = {
        expiresIn: '1h',
        jwtid: refreshTokenSecret
    };
    return jwt.sign(payload, secret, options);
}

const protected = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, secret, (error, user) => {
            if (error) {
                return res.status(401).json({Message: error});
            } else {
                req.user = user;
                next();
            }
        })
    } else {
        return res.status(403).json({Message: 'Token not found'});
    }
}


module.exports = {
    generateToken,
    refreshToken,
    protected
}