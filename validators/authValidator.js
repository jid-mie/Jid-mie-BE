const { body } = require('express-validator');
const { validateCheck } = require('../middleware/validationMiddleware');

const registerValidator = [
    body('name').notEmpty().withMessage('Tên không được để trống'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    validateCheck
];

const loginValidator = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
    validateCheck
];

module.exports = {
    registerValidator,
    loginValidator
};
