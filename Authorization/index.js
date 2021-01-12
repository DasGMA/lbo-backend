const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || '184jhhhgfdkdkjg@jgjf!';

const generateToken = (user) => {
    const payload = { user };
    const options = {
        expiresIn: '1h',
        jwtid: '12345'
    };

    return jwt.sign(payload, secret, options);
}

const protected = (req, res, next) => {
    const token = req.headers.authorization;
console.log({HEADERS: req.headers})
    if (token) {
        jwt.verify(token, secret, (error, user) => {
            if (error) {
                return res.status(400).json({Message: error});
            } else {
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
        jwtid: '12345'
    };
    return jwt.sign(payload, secret, options);
}


module.exports = {
    generateToken,
    protected
}