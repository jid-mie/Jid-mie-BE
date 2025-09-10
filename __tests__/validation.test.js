console.log('validation.test: start');
const request = require('supertest');
const mongoose = require('mongoose');

// Chỉ import model ở đầu
const User = require('../models/User');

let app; // Khai báo biến app ở đây

describe('Validation Middleware', () => {

    // Kết nối DB và nạp app trước khi chạy tất cả các test
    beforeAll(async () => {
        try {
            console.log('validation.test: beforeAll connecting to', process.env.MONGO_URL);
            await mongoose.connect(process.env.MONGO_URL);
            // --- Nạp app SAU KHI đã kết nối DB ---
            app = require('../app');
            console.log('validation.test: app required');
        } catch (err) {
            console.error('validation.test: beforeAll error', err && err.stack ? err.stack : err);
            throw err;
        }
    });

    // Ngắt kết nối DB sau khi chạy xong
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO VALIDATION CỦA ĐĂNG KÝ ---
    describe('Register Input Validation', () => {
        it('should fail with a 422 error if name is missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(422);
            // Kiểm tra xem trong mảng lỗi có lỗi nào liên quan đến trường 'name' không
            expect(res.body.errors.some(err => err.name)).toBe(true);
        });

        it('should fail with a 422 error if email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(422);
            expect(res.body.errors.some(err => err.email)).toBe(true);
        });

        it('should fail with a 422 error if password is too short', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: '123', // Mật khẩu chỉ có 3 ký tự
                });

            expect(res.statusCode).toEqual(422);
            expect(res.body.errors.some(err => err.password)).toBe(true);
        });
    });

    // --- TEST SUITE CHO VALIDATION CỦA ĐĂNG NHẬP ---
    describe('Login Input Validation', () => {
        it('should fail with a 422 error if email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'not-an-email',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(422);
            expect(res.body.errors.some(err => err.email)).toBe(true);
        });

        it('should fail with a 422 error if password is empty', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: '',
                });
                
            expect(res.statusCode).toEqual(422);
            expect(res.body.errors.some(err => err.password)).toBe(true);
        });
    });
});
