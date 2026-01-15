const { body } = require('express-validator');
const { validateCheck } = require('../middleware/validationMiddleware');

const searchTripValidator = [
    body('date').isISO8601().withMessage('Ngày tìm kiếm không hợp lệ'),
    body('vehicleType').optional().isIn(['limo', 'taxi']).withMessage('Loại xe không hợp lệ (limo, taxi)'),
    body('type').optional().isIn(['oneway', 'airport', 'hourly']).withMessage('Loại hình chuyến đi không hợp lệ'),
    validateCheck
];

module.exports = {
    searchTripValidator
};
