const TripConfig = require('../models/TripConfig');

const findByVehicleType = async (vehicleType) => {
    // Dùng lean() để truy vấn nhanh hơn vì chỉ cần đọc
    return await TripConfig.findOne({ vehicleType, isActive: true }).lean();
};

const findAllActive = async () => {
    return await TripConfig.find({ isActive: true }).lean();
};

const createOrUpdate = async (configData) => {
    return await TripConfig.findOneAndUpdate(
        { vehicleType: configData.vehicleType },
        configData,
        { upsert: true, new: true }
    );
};

module.exports = {
    findByVehicleType,
    findAllActive,
    createOrUpdate
};
