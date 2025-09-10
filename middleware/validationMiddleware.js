const { body, validationResult } = require('express-validator');

// Quy tắc cho việc đăng ký
const registerValidationRules = () => {
    return [
        // Tên không được để trống
        body('name').trim().not().isEmpty().withMessage('Tên là bắt buộc.'),
        // Email phải là một email hợp lệ
        body('email').isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
        // Mật khẩu phải có ít nhất 6 ký tự
        body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự.'),
    ];
};

// Quy tắc cho việc đăng nhập
const loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
        body('password').not().isEmpty().withMessage('Mật khẩu là bắt buộc.'),
    ];
};


// Middleware để kiểm tra kết quả xác thực
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        message: "Dữ liệu đầu vào không hợp lệ.",
        errors: extractedErrors,
    });
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
    validate,
};
