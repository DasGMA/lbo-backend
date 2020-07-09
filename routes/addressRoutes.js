const express = require('express');
const Business = require('../models/business');
const Address = require('../models/address');

const router = express.Router();

const auth = require('../Authorization/index');
const protected = auth.protected;

// Get all addresses
router.route('/').get(async (req, res) => {
    try {
        const addresses = await Address.find();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(400).json(error);
    }
});

// Post business address
router.route('/add-address').post(async (req, res) => {
    
})

module.exports = router;