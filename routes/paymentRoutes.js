const express = require('express');
const router = express.Router();
const { processPaymentRequest, vnpayReturn } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Route để frontend tạo yêu cầu thanh toán.
// Yêu cầu người dùng phải đăng nhập (được bảo vệ bởi middleware `protect`).
router.post('/request', protect, processPaymentRequest);

// Route để VNPay gọi lại sau khi người dùng hoàn tất thanh toán trên cổng của họ.
// Route này không cần đăng nhập vì nó được gọi tự động bởi server của VNPay.
// Support both '/vnpay_return' and '/vnpay-return' because some configs/envs use different naming.
router.get('/vnpay_return', vnpayReturn);
router.get('/vnpay-return', vnpayReturn);


module.exports = router;

