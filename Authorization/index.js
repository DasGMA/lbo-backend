const jwt = require('jsonwebtoken');
const config = require('../config');
const secret = config.SECRET;
const sessionSecret = config.SESSION_SECRET;


const generateToken = (user) => {
    const payload = { user };
    const options = {
        expiresIn: '1h',
        jwtid: sessionSecret
    };

    return jwt.sign(payload, secret, options);
}

const protected = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, secret, (error, user) => {
            if (error) {
                return res.status(400).json({Message: error});
            } else {
                console.log('REQ', user)
                req.user = user;
                next();
            }
        })
    } else {
        return res.status(400).json({Message: 'Token not found'});
    }
}

const refreshToken = (user) => {
    const payload = {id: user._id};
    const options = {
        jwtid: sessionSecret
    };
    return jwt.sign(payload, secret, options);
}


module.exports = {
    generateToken,
    protected
}