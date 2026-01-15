const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const bookingRepository = require('../repositories/bookingRepository');
const { sendBookingConfirmation } = require('./emailService');
const AppError = require('../utils/AppError');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createVNPayUrl = (booking, ipAddr) => {
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL || process.env.VNP_RETURNURL;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = booking._id.toString();
    const amount = booking.price;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
    return vnpUrl;
};

const initiatePayment = async (bookingId, userId, paymentMethod, ipAddr) => {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new AppError(404, 'Không tìm thấy đơn đặt xe');
    if (booking.user.toString() !== userId.toString()) throw new AppError(401, 'Không được phép');

    let paymentUrl = '';
    if (paymentMethod === 'VNPay') {
        paymentUrl = createVNPayUrl(booking, ipAddr);
    } else if (paymentMethod === 'Cash') {
        // Confirm booking immediately for cash/pay later
        // Use 'Confirmed' instead of 'Paid' if you want to distinguish status, 
        // but for now reusing 'Paid' or assuming 'Confirmed' means confirmed slot
        // Let's use 'Paid' to keep it simple, or better:
        booking.status = 'Paid'; // Or 'Confirmed' if you have that status
        await bookingRepository.save(booking);
        // Send email
        await sendBookingConfirmation(booking.user, booking);

        // Return URL to confirmation page directly
        const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
        paymentUrl = `${clientUrl}/booking/confirmation?status=success&bookingId=${booking._id}`;
    } else {
        paymentUrl = `https://momo.vn/pay?orderId=${booking._id}&amount=${booking.price}`;
    }

    return {
        message: 'Đã tạo yêu cầu thanh toán thành công!',
        paymentUrl,
        bookingId: booking._id
    };
};

const verifyVNPayReturn = async (vnp_Params) => {
    const secureHash = vnp_Params['vnp_SecureHash'];
    const bookingId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        if (responseCode == '00') {
            const booking = await bookingRepository.findByIdWithUser(bookingId);
            if (booking && booking.status !== 'Paid') {
                booking.status = 'Paid';
                await bookingRepository.save(booking);
                await sendBookingConfirmation(booking.user, booking);
            }
            return { success: true, bookingId };
        } else {
            return { success: false, bookingId, message: 'Payment failed' };
        }
    } else {
        throw new AppError(400, 'Invalid signature');
    }
};

const manualConfirm = async (bookingId, userId) => {
    const booking = await bookingRepository.findByIdWithUser(bookingId);
    if (!booking) throw new AppError(404, 'Không tìm thấy đơn đặt xe');
    if (booking.user._id.toString() !== userId.toString()) throw new AppError(401, 'Không được phép');

    if (booking.status !== 'Paid') {
        booking.status = 'Paid';
        await bookingRepository.save(booking);
        await sendBookingConfirmation(booking.user, booking);
    }

    return { message: 'Xác nhận thanh toán thành công', bookingId: booking._id };
};

module.exports = {
    initiatePayment,
    verifyVNPayReturn,
    manualConfirm
};
