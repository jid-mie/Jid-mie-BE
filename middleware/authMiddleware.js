const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // 2. Giải mã token để lấy user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Tìm người dùng trong DB bằng ID, loại bỏ mật khẩu
            req.user = await User.findById(decoded.id).select('-password');

            // --- 4. BƯỚC KIỂM TRA QUAN TRỌNG ĐƯỢC BỔ SUNG ---
            if (req.user) {
                next(); // Nếu tìm thấy người dùng, cho phép đi tiếp
            } else {
                res.status(401);
                throw new Error('Không được phép, người dùng không tồn tại');
            }
        } catch (error) {
            res.status(401);
            throw new Error('Không được phép, token không hợp lệ');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Không được phép, không tìm thấy token');
    }
});

module.exports = { protect };