const express = require('express');
const router = express.Router();
const { findTrips } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { searchTripValidator } = require('../validators/tripValidator');

// Người dùng phải đăng nhập để tìm chuyến
router.post('/find', protect, findTrips);
router.post('/search', searchTripValidator, findTrips);

module.exports = router;
