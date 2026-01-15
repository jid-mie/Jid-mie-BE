const Booking = require('../models/Booking');

// --- Basic CRUD Operations ---

const create = async (bookingData) => {
    return await Booking.create(bookingData);
};

const findById = async (id) => {
    return await Booking.findById(id);
};

const findByIdWithUser = async (id) => {
    return await Booking.findById(id).populate('user', 'name email');
};

const save = async (booking) => {
    return await booking.save();
};

const countByUser = async (userId) => {
    return await Booking.countDocuments({ user: userId });
};

const findByUser = async (userId, page, pageSize) => {
    return await Booking.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);
};

const countAll = async () => {
    return await Booking.countDocuments({});
};

const findAll = async (page, pageSize) => {
    return await Booking.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);
};

// --- Advanced / New Logic ---

// Tìm các booking ở trạng thái 'Pending' quá hạn (ví dụ: quá 15 phút)
const findExpiredPendingBookings = async (minutesLimit = 15) => {
    const timeLimit = new Date(Date.now() - minutesLimit * 60 * 1000);
    return await Booking.find({
        status: 'Pending',
        createdAt: { $lt: timeLimit }
    });
};

const updateStatus = async (bookingId, status) => {
    return await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
};

const findByTripIdsAndDateRange = async (tripIds, startDate, endDate) => {
    return await Booking.find({
        tripId: { $in: tripIds },
        bookingDate: { $gte: startDate, $lt: endDate },
        status: { $in: ['Pending', 'Paid'] }
    });
};

const findByTripAndDateRange = async (tripId, startDate, endDate) => {
    return await Booking.find({
        tripId: tripId,
        bookingDate: { $gte: startDate, $lt: endDate },
        status: { $in: ['Pending', 'Paid'] }
    });
};


module.exports = {
    create,
    findById,
    findByIdWithUser,
    save,
    countByUser,
    findByUser,
    countAll,
    findAll,
    findExpiredPendingBookings,
    updateStatus,
    findByTripIdsAndDateRange,
    findByTripAndDateRange
};
