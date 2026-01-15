const { body } = require('express-validator');
const { validateCheck } = require('../middleware/validationMiddleware');

const createBookingValidator = [
    body('tripId').notEmpty().withMessage('Mã chuyến đi (tripId) là bắt buộc'),
    body('bookingDate').isISO8601().withMessage('Ngày đặt vé không hợp lệ'),
    body('seats').isArray({ min: 1 }).withMessage('Phải chọn ít nhất một ghế (seats)'),
    body('totalPrice').isNumeric().withMessage('Tổng tiền (totalPrice) phải là số'),
    body('departureTime').notEmpty().withMessage('Giờ khởi hành là bắt buộc'),
    body('vehicleType').notEmpty().withMessage('Loại xe là bắt buộc'),
    body('pickup').notEmpty().withMessage('Điểm đón là bắt buộc'),
    validateCheck
];

module.exports = {
    createBookingValidator
};
