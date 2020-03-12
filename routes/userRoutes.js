const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.route('/').get((req, res) => {
    User.find()
        .then((users) => res.json(users))
        .catch(error => res.status(400).json(error));
})

router.route('/add').post((req, res) => {
    const userName = req.body.userName;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const zip = req.body.zip;

    const newUser = new User({
        userName,
        firstName,
        lastName,
        email,
        password,
        zip
    });

    newUser.save()
        .then(() => res.status(200).json('User has been added.'))
        .catch(error => res.status(400).json('Error: ', error))
});

module.exports = router;