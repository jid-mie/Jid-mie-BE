// Middleware để xử lý các route không tồn tại (404)
const notFound = (req, res, next) => {
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
    // Đôi khi lỗi có thể có status code 200, cần chuyển nó về 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Chỉ hiển thị stack trace khi đang ở môi trường phát triển
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
