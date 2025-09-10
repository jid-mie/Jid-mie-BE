const mongoose = require('mongoose');

// Model này lưu trữ các cấu hình gốc của tuyến xe
const tripSchema = new mongoose.Schema({
    routeId: { type: String, required: true, unique: true }, // Ví dụ: 'HANOI-HAIPHONG'
    routeName: { type: String, required: true },
    vehicleConfigs: [{
        vehicleType: { type: String, enum: ['taxi', 'limo'], required: true },
        startTime: { type: Number, default: 6 }, // Giờ bắt đầu
        endTime: { type: Number, default: 22 }, // Giờ kết thúc
        intervalMinutes: { type: Number, required: true }, // Khoảng cách giữa các chuyến
        basePrice: { type: Number }, // Giá cho taxi
        priceInfo: { type: Object }, // Giá chi tiết cho limo
        totalSeats: { type: Number, required: true },
        seatLayout: [String],
    }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
