const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User'); // Import model
const authRoutes = require('../routes/authRoutes'); // Import route cần test

// --- SETUP SERVER GIẢ LẬP ---
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Biến lưu trữ thông tin user test
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
};

// --- BỘ KIỂM THỬ ---
describe('Auth API Endpoints', () => {

    // Kết nối đến DB ảo trước khi chạy tất cả các test
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // Mock biến môi trường cần thiết
        process.env.JWT_SECRET = 'testsecret';
    });

    // Xóa tất cả dữ liệu user trước mỗi test để đảm bảo môi trường sạch
    beforeEach(async () => {
        await User.deleteMany({});
    });

    // Ngắt kết nối DB sau khi chạy xong tất cả các test
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO ĐĂNG KÝ ---
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.name).toBe(testUser.name);
        });

        it('should fail to register if email already exists', async () => {
            // Tạo user trước
            await request(app).post('/api/auth/register').send(testUser);

            // Thử tạo lại
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Email đã tồn tại');
        });
    });

    // --- TEST SUITE CHO ĐĂNG NHẬP ---
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Tạo một user trước mỗi lần test đăng nhập
            await User.create(testUser);
        });

        it('should log in an existing user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail to log in with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Email hoặc mật khẩu không đúng');
        });
    });
});