const { validationResult } = require('express-validator');

// Middleware validate chung, trả về lỗi ngay nếu có
const validateCheck = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join('. ');
        res.status(400);
        throw new Error(errorMessages);
    }
    next();
};

module.exports = { validateCheck };
