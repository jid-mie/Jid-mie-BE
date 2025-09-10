const Booking = require('../models/Booking');
// Giả lập dữ liệu cấu hình tuyến xe (trong dự án thật, bạn sẽ lấy từ DB)
const MOCK_TRIP_CONFIG = {
    vehicleConfigs: [
        { vehicleType: 'taxi', intervalMinutes: 60, price: 250000, totalSeats: 4, seatLayout: ['A1', 'A2', 'A3', 'A4'], startTime: 6, endTime: 22 },
        { vehicleType: 'limo', intervalMinutes: 90, priceInfo: { 'A': 230000, 'B': 250000, 'C': 270000 }, totalSeats: 9, seatLayout: ['A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3'], startTime: 6, endTime: 22 }
    ]
};

// --- HÀM TẠO CHUYẾN XE ĐỘNG ---
const generateTripsForDay = (date, vehicleConfig) => {
    const trips = [];
    const { startTime, endTime, intervalMinutes, vehicleType, ...restConfig } = vehicleConfig;

    let currentTime = new Date(date);
    currentTime.setHours(startTime, 0, 0, 0);

    let endOfDay = new Date(date);
    endOfDay.setHours(endTime, 0, 0, 0);

    while (currentTime < endOfDay) {
        const timeStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

        trips.push({
            id: `trip_${vehicleType}_${timeStr.replace(':', '')}`,
            time: timeStr,
            duration: vehicleType === 'taxi' ? '4h 00p' : '3h 45p',
            vehicleType: vehicleType,
            ...restConfig
        });

        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    return trips;
};

// --- HÀM TÌM KIẾM CHUYẾN ĐI ---
const findTrips = async (req, res) => {
    try {
        const { date, vehicleType, type } = req.body;

        // Xác định loại xe cần tìm
        const searchVehicleType = type === 'airport' ? 'taxi' : vehicleType;
        const vehicleConfig = MOCK_TRIP_CONFIG.vehicleConfigs.find(v => v.vehicleType === searchVehicleType);

        if (!vehicleConfig) {
            return res.status(400).json({ message: "Loại xe không hợp lệ" });
        }

        // 1. Tạo ra danh sách các chuyến đi trong ngày
        const potentialTrips = generateTripsForDay(date, vehicleConfig);

        // 2. Lấy danh sách tất cả các ghế đã được đặt trong ngày cho các chuyến đi tương ứng
        const tripIds = potentialTrips.map(t => t.id);
        const bookings = await Booking.find({ bookingDate: date, tripId: { $in: tripIds } });

        // 3. Tạo một map để dễ dàng tra cứu các ghế đã đặt
        const seatsTakenMap = {};
        for (const booking of bookings) {
            if (!seatsTakenMap[booking.tripId]) {
                seatsTakenMap[booking.tripId] = [];
            }
            seatsTakenMap[booking.tripId].push(...booking.seats);
        }

        // 4. Lọc và trả về các chuyến đi hợp lệ
        const availableTrips = potentialTrips.filter(trip => {
            trip.seatsTaken = seatsTakenMap[trip.id] || [];

            // Điều kiện 1: Chuyến đi đã đầy chỗ chưa?
            const isFull = trip.seatsTaken.length >= trip.totalSeats;
            if (isFull) return false;

            // Điều kiện 2: Chuyến đi đã qua giờ khởi hành chưa? (chỉ áp dụng cho ngày hôm nay)
            const now = new Date();
            const selectedDate = new Date(date);
            const isToday = selectedDate.toDateString() === now.toDateString();

            if (isToday) {
                const [hours, minutes] = trip.time.split(':');
                const tripTime = new Date();
                tripTime.setHours(hours, minutes, 0, 0);

                // Chỉ hiển thị chuyến nếu còn ít nhất 30 phút nữa mới khởi hành
                const departureThreshold = new Date(tripTime.getTime() - 30 * 60000);
                if (departureThreshold < now) {
                    return false;
                }
            }

            return true;
        });

        res.json(availableTrips);
    } catch (error) {
        console.error("Find trips error:", error);
        res.status(500).json({ message: "Đã có lỗi xảy ra ở server." });
    }
};

module.exports = { findTrips };

