const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../services/emailService');

// Hàm tiện ích để sắp xếp các trường của một object theo thứ tự alphabet
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
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

// HÀM TẠO YÊU CẦU THANH TOÁN
const processPaymentRequest = async (req, res) => {
    const { bookingId, paymentMethod } = req.body;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn đặt xe' });
        if (booking.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Không được phép' });

        let paymentUrl = '';

        if (paymentMethod === 'VNPay') {
            const tmnCode = process.env.VNP_TMNCODE;
            const secretKey = process.env.VNP_HASHSECRET;
            let vnpUrl = process.env.VNP_URL;
            // Accept either VNP_RETURN_URL or the existing VNP_RETURNURL name in .env
            const returnUrl = process.env.VNP_RETURN_URL || process.env.VNP_RETURNURL;

            const date = new Date();
            const createDate = moment(date).format('YYYYMMDDHHmmss');
            const orderId = booking._id.toString();
            const amount = booking.price;
            const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;

            vnp_Params = sortObject(vnp_Params);

            const signData = qs.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;

            vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
            paymentUrl = vnpUrl;
        } else {
            // Logic cho các cổng thanh toán khác (ví dụ MoMo)
            paymentUrl = `https://momo.vn/pay?orderId=${booking._id}&amount=${booking.price}`;
        }

        res.json({
            message: 'Đã tạo yêu cầu thanh toán thành công!',
            paymentUrl: paymentUrl,
            bookingId: booking._id
        });
    } catch (error) {
        console.error("Payment request error:", error);
        res.status(500).json({ message: 'Lỗi khi tạo yêu cầu thanh toán' });
    }
};

// HÀM XỬ LÝ KẾT QUẢ VNPAY TRẢ VỀ (VNPAY RETURN)
const vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const bookingId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if(secureHash === signed){
        if(responseCode == '00') {
            // Thanh toán thành công
            try {
                const booking = await Booking.findById(bookingId).populate('user');
                if (booking && booking.status !== 'Paid') { // Chỉ xử lý nếu chưa thanh toán
                    booking.status = 'Paid';
                    await booking.save();
                    await sendBookingConfirmation(booking.user, booking);
                }
                // Chuyển hướng về trang thành công trên frontend
                res.redirect(`${frontendUrl}/booking/confirmation?status=success&bookingId=${bookingId}`);
            } catch (error) {
                // Lỗi nội bộ, chuyển hướng về trang thất bại
                res.redirect(`${frontendUrl}/booking/confirmation?status=error`);
            }
        } else {
            // Thanh toán thất bại
            res.redirect(`${frontendUrl}/booking/confirmation?status=failed&bookingId=${bookingId}`);
        }
    } else{
        // Sai chữ ký, chuyển hướng về trang thất bại
        res.redirect(`${frontendUrl}/booking/confirmation?status=invalid_signature`);
    }
};


module.exports = { processPaymentRequest, vnpayReturn };

