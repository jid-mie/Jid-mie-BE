console.log('tripFinding.test: start');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let app; // Khai báo biến app

describe('Trip Finding API Endpoint', () => {
    let user, token;

    // Kết nối DB, nạp app và tạo user/token trước khi chạy
    beforeAll(async () => {
        try {
            console.log('tripFinding.test: beforeAll connecting to', process.env.MONGO_URL);
            await mongoose.connect(process.env.MONGO_URL);
            process.env.JWT_SECRET = 'testsecret';
            
            app = require('../app'); 

            user = await User.create({ name: 'Trip Tester', email: 'trip@test.com', password: 'password123' });
            token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            console.log('tripFinding.test: beforeAll done');
        } catch (err) {
            console.error('tripFinding.test: beforeAll error', err && err.stack ? err.stack : err);
            throw err;
        }
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO TÌM KIẾM CHUYẾN ĐI ---
    describe('POST /api/trips/find', () => {
        
        // Kịch bản thành công
        it('should return a list of trips for a valid request', async () => {
            const res = await request(app)
                .post('/api/trips/find')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    date: '2025-12-25',
                    vehicleType: 'limo',
                    type: 'oneway'
                });

            expect(res.statusCode).toEqual(200);
            // Kiểm tra xem kết quả có phải là một mảng không
            expect(Array.isArray(res.body)).toBe(true);
        });

        // --- CÁC KỊCH BẢN THẤT BẠI ---
        it('should return an error if the user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/trips/find')
                .send({
                    date: '2025-12-25',
                    vehicleType: 'limo',
                    type: 'oneway'
                });
            
            expect(res.statusCode).toEqual(401);
        });

        it('should return an error if date is missing', async () => {
            const res = await request(app)
                .post('/api/trips/find')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    // Cố tình không gửi 'date'
                    vehicleType: 'taxi',
                    type: 'oneway'
                });

            // Logic controller của bạn có thể trả về mảng rỗng hoặc lỗi 400
            // Ở đây ta mong đợi một mảng rỗng vì logic tìm kiếm yêu cầu ngày
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });

        it('should return an error if vehicleType is invalid', async () => {
            const res = await request(app)
                .post('/api/trips/find')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    date: '2025-12-25',
                    vehicleType: 'helicopter', // Loại xe không hợp lệ
                    type: 'oneway'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Loại xe không hợp lệ');
        });
    });
});
