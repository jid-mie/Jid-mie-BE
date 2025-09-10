const app = require('./app'); // <-- Import ứng dụng từ app.js
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redisClient');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Kết nối đến các dịch vụ cần thiết trước
        await connectDB();
        await connectRedis();

        // Sau đó mới khởi động server
        app.listen(PORT, () => {
            console.log(`Jid-mie Backend Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Không thể khởi động server:", error);
        process.exit(1);
    }
};

startServer();

