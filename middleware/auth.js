const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin auth: accept either x-api-key (shared secret) OR a Bearer JWT for an admin user.
const authMiddleware = asyncHandler(async (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
        // allowed by api key; attach a minimal admin marker so downstream handlers can read req.user.role if needed
        req.user = { role: 'admin' };
        return next();
    }

    // Fallback: accept Bearer token and validate that the user is an admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.role === 'admin') {
                req.user = user;
                return next();
            } else {
                res.status(403);
                throw new Error('Không có quyền truy cập. Yêu cầu quyền Admin.');
            }
        } catch (err) {
            res.status(401);
            throw new Error('Không được phép, token không hợp lệ');
        }
    }

    res.status(401);
    throw new Error('Unauthorized: Access Denied');
});

module.exports = authMiddleware;