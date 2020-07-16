const express = require('express');
const Business = require('../models/business');
const Like = require('../models/like');

const router = express.Router();

const auth = require('../Authorization/index');
const protected = auth.protected;

// Get all addresses
router.route('/increase-like').post(async (req, res) => {
    const { businessID, userID } = req.body;
    try {
        const business = await Business.find({ _id: businessID }).populate('likes').exec();
        if (business[0].likes) {
            if (!business[0].likes.postedBy.includes(userID)) {
                const like = await Like.findByIdAndUpdate(
                    { _id: business[0].likes._id },
                    { $push: { postedBy: userID }, $inc: { count: 1 } }
                    );
                res.status(200).json(`Like increased by 1 to businessID ${businessID} with likeID ${like._id} by userID ${userID}`);
            } else {
                const like = await Like.findByIdAndUpdate(
                    { _id: business[0].likes._id },
                    { $pull: { postedBy: userID }, $inc: { count: -1 } }
                    );
                res.status(200).json(`Like decreased by 1 to businessID ${businessID} with likeID ${like._id} by because user ${userID} already had a like.`);
            }
        } else {
            const like = new Like({
                count: 1,
                postedBy: [userID]
            });

            const newLike = await like.save();
            const updatedBusiness = await Business.findByIdAndUpdate(
                { _id: businessID },
                { likes: newLike._id },
                { new: true}
            )

            res.status(200).json(`New like model has been created with likeID: ${newLike._id}`)
        }

        
    } catch (error) {
        console.log(error)
        res.status(400).json(error);
    }
});

router.route('/decrease-like').post(async (req, res) => {
    try {
        const addresses = await Address.find();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;