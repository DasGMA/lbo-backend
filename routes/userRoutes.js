const express = require('express');
const User = require('../models/user');

const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const secret = process.env.SECRET || '184jhhhgfdkdkjg@jgjf!';

generateToken = (user) => {
    const payload = {
        password: user.password
    };

    const options = {
        expiresIn: '1h',
        jwtid: '12345'
    };

    return jwt.sign(payload, secret, options);
}

protected = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, secret, (error, decodedToken) => {
            if (error) {
                return res.status(400).json({Message: error});
            } else {
                req.user = {
                    password: decodedToken.password
                }
                next();
            }
        })
    } else {
        return res.status(400).json({Message: 'Token not found'});
    }
}

router.route('/').get((req, res) => {
    User.find()
        .then((users) => res.json(users))
        .catch(error => res.status(400).json(error));
})

router.route('/register').post((req, res) => {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 12);
    user.password = hash;

    const newUser = new User({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        zip: user.zip
    });

    newUser.save()
        .then(() => {
            const token = generateToken(newUser);
            res.status(200).json({
                message: 'User has been added.',
                token: token
            })
        })
        .catch(error => res.status(400).json('Error: ', error))
});

router.route('/login').post((req, res) => {
    const { userName, password, email } = req.body;
    if (userName.length < 4 || password.length < 4) {
        return res.status(400).json({Message: 'Username or password are too short.'});
    }
    User.findOne({userName, email})
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = generateToken(user);
                res.status(200).json({
                    Message: 'Login successful',
                    token,
                    session: req.sessionID,
                    user
                })
            } else {
                return res.status(400).json({Message: 'Wrong login details.'})
            }
        })
        .catch(error => {
            return res.status(400).json({Message: error})
        })
})

router.route('/logout').get((req, res) => {
    req.session.destroy(error => {  
        if (error){  
            res.status(400).json({Message: error});
        } else {  
            res.status(200).json({Message: 'Logout successful.'});
            //res.redirect('/');
        }  
    })
})

module.exports = router;