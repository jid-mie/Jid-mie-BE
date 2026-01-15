const mongoose = require('mongoose');

// Mô hình này dùng để tạo khóa tạm thời (Mutex) tránh Race Condition
// Nếu key đã tồn tại -> Có người khác đang thao tác -> Block
const mutexLockSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: '30s' } // Tự động xóa sau 30 giây (phòng trường hợp server crash khi đang lock)
});

module.exports = mongoose.model('MutexLock', mutexLockSchema);
