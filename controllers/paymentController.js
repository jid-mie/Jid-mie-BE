const paymentService = require('../services/paymentService');
const asyncHandler = require('express-async-handler');

const processPaymentRequest = asyncHandler(async (req, res) => {
    const { bookingId, paymentMethod } = req.body;
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    const result = await paymentService.initiatePayment(bookingId, req.user._id, paymentMethod, ipAddr);
    res.json(result);
});

const vnpayReturn = asyncHandler(async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
        const result = await paymentService.verifyVNPayReturn(req.query);
        if (result.success) {
            res.redirect(`${frontendUrl}/booking/confirmation?status=success&bookingId=${result.bookingId}`);
        } else {
            res.redirect(`${frontendUrl}/booking/confirmation?status=failed&bookingId=${result.bookingId}`);
        }
    } catch (error) {
        if (error.statusCode === 400 || error.message === 'Invalid signature') {
            res.redirect(`${frontendUrl}/booking/confirmation?status=invalid_signature`);
        } else {
            res.redirect(`${frontendUrl}/booking/confirmation?status=error`);
        }
    }
});

const confirmPayment = asyncHandler(async (req, res) => {
    const { bookingId } = req.body;
    if (!bookingId) {
        res.status(400);
        throw new Error('Thiếu bookingId'); // Could refer to AppError but simple Error works with handler too
    }

    const result = await paymentService.manualConfirm(bookingId, req.user._id);
    res.json(result);
});

module.exports = { processPaymentRequest, vnpayReturn, confirmPayment };
