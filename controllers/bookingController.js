const asyncHandler = require('express-async-handler');
const bookingService = require('../services/bookingService');

const createBooking = asyncHandler(async (req, res) => {
    const savedBooking = await bookingService.createNewBooking(req.user._id, req.body);
    res.status(201).json(savedBooking);
});

const getMyBookings = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber) || 1;
    const result = await bookingService.getUserBookings(req.user._id, page);
    res.json(result);
});

const getBookingById = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingDetails(req.params.id, req.user._id);
    res.json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
    const result = await bookingService.cancelUserBooking(req.params.id, req.user._id);
    res.json(result);
});

const getAllBookings = asyncHandler(async (req, res) => {
    const page = Number(req.query.pageNumber) || 1;
    const result = await bookingService.getAllBookingsAdmin(page);
    res.json(result);
});

module.exports = { createBooking, getMyBookings, cancelBooking, getBookingById, getAllBookings };
