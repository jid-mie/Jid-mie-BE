const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    cancelBooking,
    getBookingById,
    getAllBookings
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// --- CẤU TRÚC ROUTE THEO CHUẨN RESTFUL ---

// Tất cả các route cho người dùng thông thường đều được bảo vệ
router.use(protect);

// Route cho /api/bookings
router.route('/')
    .post(createBooking)    // POST /api/bookings
    .get(getMyBookings);     // GET /api/bookings

// Route cho /api/bookings/:id
router.route('/:id')
    .get(getBookingById)     // GET /api/bookings/some_id
    .patch(cancelBooking);   // PATCH /api/bookings/some_id

// --- ROUTE CHỈ DÀNH CHO ADMIN ---
// Lưu ý: Route này được đặt riêng để không bị nhầm lẫn với /:id
router.route('/admin/all')
    .get(protect, admin, getAllBookings); // GET /api/bookings/admin/all

module.exports = router;