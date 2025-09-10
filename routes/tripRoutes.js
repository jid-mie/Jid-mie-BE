const express = require('express');
const router = express.Router();
const { findTrips } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Người dùng phải đăng nhập để tìm chuyến
router.post('/find', protect, findTrips);

module.exports = router;
