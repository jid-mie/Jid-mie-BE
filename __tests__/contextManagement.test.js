console.log('contextManagement.test: start');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServicePage = require('../models/ServicePage');

let app; // Khai báo biến app

describe('Content Management (CMS) API Endpoints', () => {
    let adminUser, customerUser, adminToken;
    let servicePageId;

    // Kết nối DB, nạp app và tạo dữ liệu mẫu
    beforeAll(async () => {
        try {
            console.log('contextManagement.test: beforeAll connecting to', process.env.MONGO_URL);
            await mongoose.connect(process.env.MONGO_URL);
            process.env.JWT_SECRET = 'testsecret';
            process.env.ADMIN_API_KEY = 'test_admin_api_key'; // Mock API key
            
            app = require('../app'); 

            adminUser = await User.create({ name: 'Admin User', email: 'contentadmin@test.com', password: 'password123', role: 'admin' });
            customerUser = await User.create({ name: 'Customer User', email: 'contentcustomer@test.com', password: 'password123' });

            adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
            console.log('contextManagement.test: beforeAll done');
        } catch (err) {
            console.error('contextManagement.test: beforeAll error', err && err.stack ? err.stack : err);
            throw err;
        }
    });
    
    // Xóa các trang dịch vụ trước mỗi test
    beforeEach(async () => {
        await ServicePage.deleteMany({});
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    // --- TEST SUITE CHO ADMIN CMS ROUTES ---
    describe('Admin Service Page Management', () => {
        
        it('should allow an admin to create a new service page', async () => {
            const res = await request(app)
                .post('/api/admin/service-pages')
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send({
                    title: 'Dịch vụ Taxi Sân bay',
                    content: 'Nội dung chi tiết...',
                    status: 'published'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.title).toBe('Dịch vụ Taxi Sân bay');
            servicePageId = res.body._id; // Lưu lại ID để dùng cho các test sau
        });

        it('should allow an admin to get all service pages', async () => {
            const res = await request(app)
                .get('/api/admin/service-pages')
                .set('x-api-key', process.env.ADMIN_API_KEY);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        
        it('should fail if a non-admin tries to create a service page (wrong api key)', async () => {
             const res = await request(app)
                .post('/api/admin/service-pages')
                .set('x-api-key', 'wrong_key')
                .send({ title: 'Thử nghiệm' });
            
            expect(res.statusCode).toEqual(401);
        });
    });

    // --- TEST SUITE CHO PUBLIC CONTENT ROUTES ---
    describe('Public Content Access', () => {
        beforeEach(async () => {
            // Tạo một trang đã xuất bản và một trang nháp
            await ServicePage.create({ title: 'Published Page', slug: 'published-page', status: 'published' });
            await ServicePage.create({ title: 'Draft Page', slug: 'draft-page', status: 'draft' });
        });

        it('should allow anyone to access a published page via its slug', async () => {
            const res = await request(app)
                .get('/api/pages/published-page');

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toBe('Published Page');
        });

        it('should return a 404 error when trying to access a draft page', async () => {
            const res = await request(app)
                .get('/api/pages/draft-page');

            expect(res.statusCode).toEqual(404);
        });

        it('should return a 404 error for a non-existent slug', async () => {
            const res = await request(app)
                .get('/api/pages/non-existent-slug');
                
            expect(res.statusCode).toEqual(404);
        });
    });
});
