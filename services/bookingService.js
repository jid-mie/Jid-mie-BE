const bookingRepository = require('../repositories/bookingRepository');
const { getDayRange } = require('../utils/dateHelpers');
const { sendBookingConfirmation } = require('./emailService');
const AppError = require('../utils/AppError');
const MutexLock = require('../models/MutexLock');

const createNewBooking = async (userId, bookingData) => {
    const { tripId, bookingDate, seats, totalPrice, departureTime, vehicleType, pickup, destination, ...otherDetails } = bookingData;

    // Validation
    const dayRange = getDayRange(bookingDate);
    if (!dayRange) {
        throw new AppError(400, "Ngày đặt không hợp lệ.");
    }
    const { start: bookingDateObj, end: bookingDateEnd } = dayRange;

    // --- CRITICAL SECTION START: PREVENT RACE CONDITION ---
    // Tạo key unique cho từng ghế: lock_{tripId}_{date}_{seatChar}
    // Ví dụ: lock_trip_limo_0800_2025-01-20_A1
    const lockKeys = seats.map(seat => `lock_${tripId}_${bookingDateObj.toISOString().split('T')[0]}_${seat}`);

    try {
        // 1. Cố gắng acquire lock cho TẤT CẢ các ghế
        // insertMany với ordered: true (mặc định) sẽ fail ngay nếu gặp duplicate key
        await MutexLock.insertMany(lockKeys.map(key => ({ key })));
    } catch (error) {
        // Nếu lỗi do duplicate key (code 11000) -> Ghế đang bị người khác thao tác
        if (error.code === 11000) {
            throw new AppError(409, "Một trong các ghế bạn chọn đang được người khác thanh toán. Vui lòng thử lại sau giây lát.");
        }
        throw error;
    }

    try {
        // 2. Logic kiểm tra availability bình thường (Double Check)
        const existingBookings = await bookingRepository.findByTripAndDateRange(tripId, bookingDateObj, bookingDateEnd);
        const takenSeats = existingBookings.flatMap(b => b.seats || []);
        const unavailableSeats = seats.filter(seat => takenSeats.includes(seat));

        if (unavailableSeats.length > 0) {
            throw new AppError(409, `Rất tiếc, các ghế sau đã có người khác đặt: ${unavailableSeats.join(', ')}. Vui lòng chọn lại.`);
        }

        // 3. Create booking
        const savedBooking = await bookingRepository.create({
            ...otherDetails,
            tripId,
            bookingDate: bookingDateObj,
            departureTime,
            vehicleType,
            pickup,
            destination,
            seats,
            price: totalPrice,
            totalPrice: totalPrice,
            tripDetails: {
                id: tripId,
                date: bookingDate,
                time: departureTime,
                pickup,
                destination,
                vehicleType
            },
            user: userId,
            status: 'Pending',
        });

        return savedBooking;

    } finally {
        // --- CRITICAL SECTION END ---
        // 4. Giải phóng lock dù thành công hay thất bại
        try {
            await MutexLock.deleteMany({ key: { $in: lockKeys } });
        } catch (cleanupError) {
            console.error("Failed to cleanup locks:", cleanupError);
            // Không throw lỗi ở đây để tránh làm user tưởng đặt vé thất bại
        }
    }
};

const getUserBookings = async (userId, page = 1, pageSize = 10) => {
    const count = await bookingRepository.countByUser(userId);
    const bookings = await bookingRepository.findByUser(userId, page, pageSize);

    return { bookings, page, pages: Math.ceil(count / pageSize), total: count };
};

const getBookingDetails = async (bookingId, userId) => {
    const booking = await bookingRepository.findByIdWithUser(bookingId);

    if (!booking) {
        throw new AppError(404, 'Không tìm thấy chuyến đi.');
    }

    if (booking.user._id.toString() !== userId.toString()) {
        throw new AppError(401, 'Không được phép xem thông tin này.');
    }

    return booking;
};

const cancelUserBooking = async (bookingId, userId) => {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
        throw new AppError(404, 'Không tìm thấy chuyến đi.');
    }

    if (booking.user.toString() !== userId.toString()) {
        throw new AppError(401, 'Không được phép thực hiện hành động này.');
    }

    if (booking.status === 'Cancelled') {
        throw new AppError(400, 'Chuyến đi này đã được hủy trước đó.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking.bookingDate);

    if (bookingDate <= today) {
        throw new AppError(400, 'Không thể hủy các chuyến đi trong ngày hoặc đã qua.');
    }

    booking.status = 'Cancelled';
    await bookingRepository.save(booking);
    return { message: 'Chuyến đi đã được hủy thành công.' };
};

const getAllBookingsAdmin = async (page = 1, pageSize = 20) => {
    const count = await bookingRepository.countAll();
    const bookings = await bookingRepository.findAll(page, pageSize);

    return { bookings, page, pages: Math.ceil(count / pageSize), total: count };
};

module.exports = {
    createNewBooking,
    getUserBookings,
    getBookingDetails,
    cancelUserBooking,
    getAllBookingsAdmin
};
