// Middleware này sẽ được dùng sau middleware `protect`

const admin = (req, res, next) => {
    // Middleware `protect` đã thêm đối tượng `user` vào `req`
    if (req.user && req.user.role === 'admin') {
        next(); // Nếu là admin, cho phép đi tiếp
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập. Yêu cầu quyền Admin.' });
    }
};

module.exports = { admin };
