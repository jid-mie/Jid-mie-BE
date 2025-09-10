const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Chỉ import các model và middleware cần thiết ở đầu
const User = require('../models/User');
const Booking = require('../models/Booking');
const { errorHandler } = require('../middleware/errorMiddleware');

// --- SETUP SERVER GIẢ LẬP ---
const app = express();
app.use(express.json());

// --- BỘ KIỂM THỬ ---
describe('Booking API Endpoints', () => {
    let user1, user2, token1, token2;
    const bookingDetails = {
        tripId: "trip_limo_0900",
        bookingDate: "2025-12-25",
        departureTime: "09:00",
        vehicleType: "limo",
        pickup: "Hanoi",
        destination: "Ha Long",
        seats: ["A1", "A2"],
        totalPrice: 460000
    };

    // Kết nối đến DB và nạp route trước khi chạy tất cả các test
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
        process.env.JWT_SECRET = 'testsecret';

        // --- TRÌ HOÃN VIỆC NẠP ROUTE ĐẾN SAU KHI DB ĐÃ KẾT NỐI ---
        const bookingRoutes = require('../routes/bookingRoutes');
        app.use('/api/bookings', bookingRoutes);
        app.use(errorHandler); // Thêm error handler sau route

        // Tạo user và token
        user1 = await User.create({ name: 'User One', email: 'user1@test.com', password: 'password123' });
        user2 = await User.create({ name: 'User Two', email: 'user2@test.com', password: 'password123' });
        token1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET);
        token2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET);
    });

    beforeEach(async () => {
        await Booking.deleteMany({});
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO VIỆC TẠO BOOKING ---
    describe('POST /api/bookings', () => {
        it('should create a booking for an authenticated user', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token1}`)
                .send(bookingDetails);

            expect(res.statusCode).toEqual(201);
            expect(res.body.user).toBe(user1._id.toString());
        });

        it('should fail if user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);

            expect(res.statusCode).toEqual(401);
        });

        it('should prevent double-booking the same seat', async () => {
            await request(app).post('/api/bookings').set('Authorization', `Bearer ${token1}`).send(bookingDetails);

            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token2}`)
                .send(bookingDetails);

            expect(res.statusCode).toEqual(409);
        });
    });

    // --- TEST SUITE CHO VIỆC XEM VÀ HỦY BOOKING ---
    describe('GET & PATCH /api/bookings/:id', () => {
        let bookingId;

        beforeEach(async () => {
            const res = await request(app).post('/api/bookings').set('Authorization', `Bearer ${token1}`).send(bookingDetails);
            bookingId = res.body._id;
        });

        it('should allow a user to get their own booking details', async () => {
            const res = await request(app)
                .get(`/api/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.user._id).toBe(user1._id.toString());
        });

        it('should NOT allow a user to get another user\'s booking', async () => {
            const res = await request(app)
                .get(`/api/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.statusCode).toEqual(401);
        });

        it('should allow a user to cancel their own booking', async () => {
            const res = await request(app)
                .patch(`/api/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Chuyến đi đã được hủy thành công.');
        });

        it('should NOT allow a user to cancel another user\'s booking', async () => {
            const res = await request(app)
                .patch(`/api/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.statusCode).toEqual(401);
        });
    });
});

