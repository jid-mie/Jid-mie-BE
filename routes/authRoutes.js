const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, loginUser, refreshToken } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const authService = require('../services/authService'); // Import authService

// --- Các route đăng nhập/đăng ký bằng email ---
router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/refresh', refreshToken); // <-- Route làm mới token

// --- Route xác thực với Google ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// --- Route Callback từ Google ---
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    (req, res) => {
        // 1. Tạo JWT Token chuẩn (15m) & Refresh Token
        const token = authService.generateToken(req.user._id);
        const refreshToken = authService.generateRefreshToken(req.user._id);

        // 2. Chuẩn bị dữ liệu để gửi về frontend qua Cookie (Transport Cookie)
        const transportData = JSON.stringify({
            token,
            refreshToken,
            name: req.user.name,
            email: req.user.email
        });

        // 3. Đặt Cookie ngắn hạn (15s) để chuyển dữ liệu an toàn
        res.cookie('auth_transport', transportData, {
            maxAge: 15 * 1000,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        // 4. Điều hướng về trang callback của frontend
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
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
        // Logic tương tự Google
        const token = authService.generateToken(req.user._id);
        const refreshToken = authService.generateRefreshToken(req.user._id);

        const transportData = JSON.stringify({
            token,
            refreshToken,
            name: req.user.name,
            email: req.user.email
        });

        res.cookie('auth_transport', transportData, {
            maxAge: 15 * 1000,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }
);

module.exports = router;
