(async () => {
  try {
    // Simple test harness for the email service
    const { sendBookingConfirmation } = require('../services/emailService');

    const testUser = {
      name: 'Test User',
      email: 'test.user@example.com'
    };

    const testBooking = {
      _id: 'TESTBOOKING123',
      bookingType: 'limo',
      price: 123000,
      tripDetails: {
        pickup: 'Hanoi',
        destination: 'Haiphong',
        date: '2025-09-11',
        time: '10:00'
      }
    };

    await sendBookingConfirmation(testUser, testBooking);
    console.log('sendTestEmail finished');
  } catch (err) {
    console.error('sendTestEmail error:', err);
    process.exit(1);
  }
})();
