const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('../controllers/authController');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validationMiddleware');

// --- Các route đăng nhập/đăng ký bằng email ---
router.post('/register' , registerValidationRules(), validate, registerUser);
router.post('/login', loginValidationRules(), validate, loginUser);

// --- Route xác thực với Google ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// --- Route Callback từ Google ---
// Đây là nơi xử lý điều hướng sau khi Google xác thực thành công
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`, // Nếu lỗi, về trang login của frontend
        session: false
    }),
    (req, res) => {
        // 1. Tạo JWT Token cho người dùng đã được xác thực
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // 2. Chuẩn bị thông tin người dùng để gửi về frontend
        const userString = encodeURIComponent(JSON.stringify({
            name: req.user.name,
            email: req.user.email
        }));

        // 3. Điều hướng trình duyệt của người dùng về trang callback của frontend
        //    kèm theo token và thông tin người dùng trên URL
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userString}`);
    }
);

// --- Route xác thực với Facebook ---
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// --- Route Callback từ Facebook ---
router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    (req, res) => {
        // Logic tương tự như Google
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const userString = encodeURIComponent(JSON.stringify({ name: req.user.name, email: req.user.email }));
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userString}`);
    }
);

module.exports = router;

