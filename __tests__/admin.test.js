console.log('admin.test: start');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let app; // Khai báo biến app

describe('Admin API Endpoints', () => {
    let adminUser, customerUser, adminToken, customerToken;

    // Kết nối DB, nạp app và tạo dữ liệu mẫu
    beforeAll(async () => {
        try {
            console.log('admin.test: beforeAll connecting to', process.env.MONGO_URL);
            await mongoose.connect(process.env.MONGO_URL);
            process.env.JWT_SECRET = 'testsecret';
            
            app = require('../app'); 

            // Tạo một người dùng với vai trò 'admin'
            adminUser = await User.create({ 
                name: 'Admin User', 
                email: 'admin@test.com', 
                password: 'password123',
                role: 'admin' 
            });

            // Tạo một người dùng với vai trò 'customer' (mặc định)
            customerUser = await User.create({ 
                name: 'Customer User', 
                email: 'customer@test.com', 
                password: 'password123' 
            });

            // Tạo token cho mỗi người
            adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
            customerToken = jwt.sign({ id: customerUser._id }, process.env.JWT_SECRET);
            console.log('admin.test: beforeAll done');
        } catch (err) {
            console.error('admin.test: beforeAll error', err && err.stack ? err.stack : err);
            throw err;
        }
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO API LẤY TẤT CẢ CÁC BOOKING ---
    describe('GET /api/bookings/admin/all', () => {
        
        it('should allow an admin user to get all bookings', async () => {
            const res = await request(app)
                .get('/api/bookings/admin/all')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            // Kiểm tra xem kết quả có phải là một object chứa mảng 'bookings' không
            expect(res.body).toHaveProperty('bookings');
            expect(Array.isArray(res.body.bookings)).toBe(true);
        });

        it('should return a 403 Forbidden error for a non-admin user', async () => {
            const res = await request(app)
                .get('/api/bookings/admin/all')
                .set('Authorization', `Bearer ${customerToken}`); // Dùng token của customer

            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('Không có quyền truy cập. Yêu cầu quyền Admin.');
        });

        it('should return a 401 Unauthorized error if no token is provided', async () => {
            const res = await request(app)
                .get('/api/bookings/admin/all');

            expect(res.statusCode).toEqual(401);
        });
    });
});
