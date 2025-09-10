const asyncHandler = require('express-async-handler'); // <-- 1. IMPORT
const Booking = require('../models/Booking');

// 2. BỌC MỖI HÀM TRONG asyncHandler(...)
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Không tìm thấy chuyến đi.');
    }

    if (booking.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Không được phép thực hiện hành động này.');
    }

    if (booking.status === 'Cancelled') {
        res.status(400);
        throw new Error('Chuyến đi này đã được hủy trước đó.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking.bookingDate);

    if (bookingDate <= today) {
        res.status(400);
        throw new Error('Không thể hủy các chuyến đi trong ngày hoặc đã qua.');
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({ message: 'Chuyến đi đã được hủy thành công.' });
});

const getMyBookings = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const count = await Booking.countDocuments({ user: req.user._id });
    const bookings = await Booking.find({ user: req.user._id })
        .sort({ bookingDate: -1, departureTime: 1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ bookings, page, pages: Math.ceil(count / pageSize), total: count });
});

const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');

    if (!booking) {
        res.status(404);
        throw new Error('Không tìm thấy chuyến đi.');
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Không được phép xem thông tin này.');
    }

    res.json(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;
    const count = await Booking.countDocuments({});
    const bookings = await Booking.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ bookings, page, pages: Math.ceil(count / pageSize), total: count });
});

const createBooking = asyncHandler(async (req, res) => {
    const { tripId, bookingDate, seats, totalPrice, departureTime, vehicleType, pickup, destination, ...otherDetails } = req.body;

    if (!tripId || !bookingDate || !seats || !totalPrice || seats.length === 0) {
        res.status(400);
        throw new Error("Dữ liệu đặt vé không đầy đủ.");
    }

    // Normalize bookingDate to Date object for comparisons
    const bookingDateObj = new Date(bookingDate);

    const existingBookings = await Booking.find({ tripId, bookingDate: bookingDateObj, status: { $in: ['Pending', 'Paid'] } });
    const takenSeats = existingBookings.flatMap(b => b.seats || []);
    const unavailableSeats = seats.filter(seat => takenSeats.includes(seat));

    if (unavailableSeats.length > 0) {
        res.status(409);
        throw new Error(`Rất tiếc, các ghế sau đã có người khác đặt: ${unavailableSeats.join(', ')}. Vui lòng chọn lại.`);
    }

    const booking = new Booking({
        ...otherDetails,
        tripId,
        bookingDate: bookingDateObj,
        departureTime,
        vehicleType,
        pickup,
        destination,
        seats,
        price: totalPrice,
        tripDetails: {
            id: tripId,
            date: bookingDate,
            time: departureTime,
            pickup,
            destination,
            vehicleType
        },
        user: req.user._id,
        status: 'Pending',
    });
    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
});

module.exports = { createBooking, getMyBookings, cancelBooking, getBookingById, getAllBookings };