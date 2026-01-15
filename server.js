const app = require('./app'); // <-- Import ứng dụng từ app.js
const connectDB = require('./config/db');
const seedTripConfigs = require('./scripts/seedTripConfig'); // Import Seeder
const checkExpiredBookings = require('./jobs/cleanupBookings'); // Import Cron Job
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Kết nối đến các dịch vụ cần thiết trước
        await connectDB();

        // Khởi tạo dữ liệu cấu hình chuyến xe (chỉ chạy khi cần thiết, ở đây để tự động tạo lần đầu)
        await seedTripConfigs();

        // Kích hoạt Cron Jobs
        checkExpiredBookings();

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

