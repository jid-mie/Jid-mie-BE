const asyncHandler = require('express-async-handler');
const tripService = require('../services/tripService');

const findTrips = asyncHandler(async (req, res) => {
    const result = await tripService.searchTrips(req.body);
    res.json(result);
});

module.exports = { findTrips };
