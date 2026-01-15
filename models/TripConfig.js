const mongoose = require('mongoose');

const tripConfigSchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        required: true,
        unique: true,
        enum: ['limo', 'taxi'] // Có thể mở rộng
    },
    intervalMinutes: { type: Number, required: true }, // Tần suất chuyến (phút)
    startTime: { type: Number, required: true }, // Giờ bắt đầu (0-23)
    endTime: { type: Number, required: true }, // Giờ kết thúc (0-23)
    totalSeats: { type: Number, required: true },
    seatLayout: [{ type: String }], // Danh sách mã ghế ['A1', 'A2', ...]

    // Giá vé có thể là số cố định hoặc object tùy loại xe
    price: { type: Number }, // Dùng cho taxi đồng giá
    priceInfo: { type: Map, of: Number }, // Dùng cho limo giá theo hàng ghế: { 'A': 230000, 'B': 250000 }

    // Cấu hình phụ thu ngày lễ
    holidaySurcharges: [{
        name: String,   // Tên dịp lễ (VD: Tết Nguyên Đán)
        startDate: Date,
        endDate: Date,
        surchargePercent: Number, // % tăng giá (VD: 20 -> tăng 20%)
        surchargeAmount: Number   // Số tiền tăng cứng (VD: 50000 -> tăng 50k)
    }],

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TripConfig', tripConfigSchema);
