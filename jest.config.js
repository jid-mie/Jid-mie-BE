module.exports = {
    testEnvironment: 'node',
    // Cấu hình để Jest sử dụng file setup cho MongoDB
    preset: '@shelf/jest-mongodb',
    // Tự động xóa các mock sau mỗi lần test
    clearMocks: true,
};