const express = require('express');
const User = require('../models/user');

const router = express.Router();
const bcrypt = require('bcryptjs');

const auth = require('../Authorization/index');
const e = require('express');
const protected = auth.protected;
const generateToken = auth.generateToken;

router.route('/').get(async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json(error);
    }
})

router.route('/user').get(protected, (req, res) => {
    const _id = req.user.user._id;
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
        accountType: user.accountType,
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

router.route('/delete-account').delete(protected, async (req, res) => {
    const _id = req.body;
    try {
        const user = await User.findOne({ _id });
        if (!user) {
            res.status(400).json({Message: 'User does not exist.'})
        } else {
            await User.remove({ _id });
            res.status(200).json({Message: `User with _id: ${user._id} has been deleted!`});
        }
    } catch (error) {
        res.status(400).json(error);
    }
})

router.route('/update/').put(protected, async (req, res) => {
    const {
        accountType,
        zip,
        _id,
        userName,
        firstName,
        lastName,
        email,
        password
    } = req.user.user;

    const user = req.body;

    const updatedUser = {
        userName: user.userName ? user.userName : userName,
        firstName: user.firstName ? user.firstName : firstName,
        lastName: user.lastName ? user.lastName : lastName,
        email,
        accountType: user.accountType ? user.accountType : accountType,
        password,
        zip: user.zip ? user.zip : zip
    }

    const options = {
        new: true
    }

    try {
        const user = await User.findByIdAndUpdate({_id}, updatedUser, options);
        res.status(200).json({Message: 'Updated success.'});

    } catch (error) {
        res.status(400).json(error);
    }
})



module.exports = router;