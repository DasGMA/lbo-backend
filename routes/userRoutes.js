const express = require('express');
const User = require('../models/user');

const router = express.Router();
const bcrypt = require('bcryptjs');

const auth = require('../Authorization/index');
const protected = auth.protected;
const generateToken = auth.generateToken;

router.route('/').get((req, res) => {
    User.find()
        .then((users) => res.json(users))
        .catch(error => res.status(400).json(error));
})

router.route('/user').get(protected, (req, res) => {
    const _id = req.user.userID;
    User.findOne({ _id })
        .then((user) => res.json(user))
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
        .catch(error => res.status(400).json({Error: error}))
});

router.route('/login').post((req, res) => {
    const { userName, password } = req.body;

    User.findOne({ userName })
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                
                user.loggedIn = true;
                user.save()
                    .then(() => {
                        const token = generateToken(user);
                        res.status(200).json({
                            Message: 'Login successful',
                            token,
                            session: req.sessionID,
                            user
                        });
                    })
                    .catch(error => res.status(400).json({Error: error}))
                
            } else {
                return res.status(400).json({LoginDetails: 'Wrong login details.'})
            }
        })
        .catch(error => {
            return res.status(400).json({Message: error})
        })
})

router.route('/logout').post(protected, (req, res) => {
    const _id  = req.body;

    User.findOne({ _id })
        .then(user => {
            user.loggedIn = false;
            user.save()
                .then(() => {
                    req.session.destroy(error => {  
                        if (error){  
                            res.status(400).json({Message: error});
                        } else {  
                            res.status(200).json({Message: 'Logout successful.'});
                        }  
                    })
                })
                .catch(error => res.status(400).json({Error: error}))
            
        })
        .catch(error => {
            return res.status(400).json({Message: error})
        })
})

module.exports = router;