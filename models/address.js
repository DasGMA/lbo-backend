const mongoose = require("mongoose");

const AddressSchema = mongoose.Schema(
    {
        type: {
            type: String,
            default: 'address'
        },
        streetApartmentNumber: {
            type: Number,
            required: true
        },
        streetName: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: "usa",
            enum: ["usa"],
        },
        state: {
            type: String,
            default: "california",
            enum: ["california"],
            required: true,
        },
        city: {
            type: String,
            default: "long beach",
            enum: ["long beach"],
        },
        zip: {
            type: Number,
            required: true,
            enum: [
                90745,
                90746,
                90747,
                90749,
                90755,
                90801,
                90802,
                90803,
                90804,
                90805,
                90806,
                90807,
                90808,
                90809,
                90810,
                90813,
                90814,
                90815,
                90822,
                90831,
                90832,
                90833,
                90834,
                90835,
                90840,
                90842,
                90844,
                90846,
                90847,
                90848,
                90853,
                90895,
                90899
            ],
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", AddressSchema);
module.exports = Address;
