const cron = require('node-cron');
const bookingRepository = require('../repositories/bookingRepository');

// Chạy mỗi phút 1 lần
const checkExpiredBookings = () => {
    cron.schedule('* * * * *', async () => {
        try {
            console.log('⏳ Running Cron: Checking for expired bookings...');

            // Tìm các vé Pending quá 15 phút
            const expiredBookings = await bookingRepository.findExpiredPendingBookings(15);

            if (expiredBookings.length > 0) {
                console.log(`Found ${expiredBookings.length} expired bookings. Cancelling...`);

                for (const booking of expiredBookings) {
                    await bookingRepository.updateStatus(booking._id, 'Cancelled');
                    // Có thể thêm logic gửi email thông báo vé đã bị hủy tại đây
                }

                console.log('✅ Expired bookings cancelled successfully.');
            }
        } catch (error) {
            console.error('❌ Error in Cron Job:', error.message);
        }
    });
};

module.exports = checkExpiredBookings;
