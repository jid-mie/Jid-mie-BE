const tripConfigRepository = require('../repositories/tripConfigRepository');

// Script này chỉ chạy để khởi tạo dữ liệu lần đầu. 
// Nếu dữ liệu đã tồn tại, nó sẽ KHÔNG làm gì cả (để bảo toàn các thay đổi của Admin)
const seedTripConfigs = async () => {
    const configs = [
        {
            vehicleType: 'taxi',
            intervalMinutes: 60,
            price: 250000,
            totalSeats: 4,
            seatLayout: ['A1', 'A2', 'A3', 'A4'],
            startTime: 6,
            endTime: 22
        },
        {
            vehicleType: 'limo',
            intervalMinutes: 90,
            priceInfo: { 'A': 230000, 'B': 250000, 'C': 270000 },
            totalSeats: 9,
            seatLayout: ['A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3'],
            startTime: 6,
            endTime: 22
        }
    ];

    for (const config of configs) {
        // Kiểm tra xem config đã tồn tại chưa
        const existingConfig = await tripConfigRepository.findByVehicleType(config.vehicleType);

        if (!existingConfig) {
            // Chỉ tạo mới nếu chưa có
            await tripConfigRepository.createOrUpdate(config);
            console.log(`✅ Seeded default config for ${config.vehicleType}`);
        } else {
            // Nếu có rồi thì bỏ qua
            // console.log(`ℹ️ Config for ${config.vehicleType} already exists. Skipping.`);
        }
    }
    console.log('Trip Configuration Check Completed');
};

module.exports = seedTripConfigs;
