const jwt = require('jsonwebtoken');
const config = require('../config');
const Token = require('../models/token');
const crypto = require('crypto');
const secret = config.SECRET;
const tokenSecret = config.TOKEN_SECRET;
const refreshTokenSecret = config.REFRESH_TOKEN_SECRET;

const randomTokenString = () => {
    return crypto.randomBytes(40).toString('hex');
}

// Generate token using user id that expires in 15 minutes
const generateToken = (user) => {
    const payload = { sub: user._id, id: user._id };
    const options = { expiresIn: '15m', jwtid: tokenSecret };

    return jwt.sign(payload, secret, options);
}

const generateRefreshToken = async (user, ipAddress) => {
    const newToken = new Token({
        user: user._id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });

    try {
        await newToken.save();
    } catch (error) {
        throw({ Message: error.message});
    }
}

const protected = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({Message: 'Token not found'});
   
    jwt.verify(token, secret, (error, user) => {
        if (error) return res.status(401).json({Error: error.message});
        req.user = user.user;
        next();
    })
}

const sendVerificationEmail = async (user, origin) => {
    
}

module.exports = {
    generateToken,
    generateRefreshToken,
    protected
}