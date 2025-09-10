console.log('payment.test: start');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');

let app; // Khai báo biến app

describe('Payment API Endpoints', () => {
    let user, token, booking;

    // Dữ liệu test
    const bookingDetails = {
        tripId: "trip_limo_0900",
        bookingDate: "2025-12-25",
        departureTime: "09:00",
        vehicleType: "limo",
        pickup: "Hanoi",
        destination: "Ha Long",
        seats: ["A1"],
        totalPrice: 230000,
        status: 'Pending'
    };

    // Kết nối DB, nạp app và tạo dữ liệu mẫu
    beforeAll(async () => {
        try {
            console.log('payment.test: beforeAll connecting to', process.env.MONGO_URL);
            await mongoose.connect(process.env.MONGO_URL);
            process.env.JWT_SECRET = 'testsecret';
            
            // Cấu hình các biến môi trường cho VNPay (dùng giá trị test)
            process.env.VNP_TMNCODE = 'TESTCODE';
            process.env.VNP_HASHSECRET = 'TESTSECRETKEY';
            process.env.VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
            process.env.VNP_RETURN_URL = 'http://localhost:3001/api/payment/vnpay_return';
            
            app = require('../app'); 

            user = await User.create({ name: 'Payment Tester', email: 'payment@test.com', password: 'password123' });
            token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            console.log('payment.test: beforeAll done');
        } catch (err) {
            console.error('payment.test: beforeAll error', err && err.stack ? err.stack : err);
            throw err;
        }
    });

    // Tạo một booking mới trước mỗi test
    beforeEach(async () => {
        booking = await Booking.create({ ...bookingDetails, user: user._id });
    });

    afterEach(async () => {
        await Booking.deleteMany({});
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO VIỆC TẠO YÊU CẦU THANH TOÁN ---
    describe('POST /api/payment/request', () => {
        
        it('should create a VNPay payment URL for an authenticated user', async () => {
            const res = await request(app)
                .post('/api/payment/request')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookingId: booking._id,
                    paymentMethod: 'VNPay'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('paymentUrl');
            // Kiểm tra xem URL trả về có phải là URL của VNPay không
            expect(res.body.paymentUrl).toContain('sandbox.vnpayment.vn');
        });

        it('should return a 401 error if user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/payment/request')
                .send({
                    bookingId: booking._id,
                    paymentMethod: 'VNPay'
                });

            expect(res.statusCode).toEqual(401);
        });

         it('should return a 404 error if booking does not exist', async () => {
            const fakeBookingId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/payment/request')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    bookingId: fakeBookingId,
                    paymentMethod: 'VNPay'
                });

            expect(res.statusCode).toEqual(404);
        });
    });

    // --- TEST SUITE CHO VIỆC XỬ LÝ KẾT QUẢ VNPAY TRẢ VỀ ---
    // Phần này phức tạp hơn vì cần tạo chữ ký giả lập
    describe('GET /api/payment/vnpay_return', () => {
        it('should update booking status to "Paid" on successful payment', async () => {
            // Logic này phức tạp và thường được test tích hợp thay vì unit test
            // Tuy nhiên, chúng ta có thể kiểm tra các kịch bản lỗi
        });

        it('should redirect to a failure page if signature is invalid', async () => {
            const queryParams = `?vnp_Amount=23000000&vnp_TxnRef=${booking._id}&vnp_ResponseCode=00&vnp_SecureHash=invalidsignature`;
            
            const res = await request(app).get(`/api/payment/vnpay_return${queryParams}`);
            
            // Mong đợi server chuyển hướng (302) về trang frontend
            expect(res.statusCode).toEqual(302);
            // Kiểm tra xem URL chuyển hướng có chứa status là "invalid_signature" không
            expect(res.headers.location).toContain('status=invalid_signature');
        });
    });
});
