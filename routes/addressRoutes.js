const express = require("express");
const Business = require("../models/business");
const Address = require("../models/address");

const router = express.Router();

const auth = require("../Authorization/index");
const protected = auth.protected;

// Get all addresses
router.route("/addresses").get(async (req, res) => {
  try {
    const addresses = await Address.find();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(400).json(error);
  }
});

// const updateAddress = { $set: {
//     streetApartmentNumber,
//     streetName,
//     country,
//     state,
//     city,
//     zip
// }};

module.exports = router;
