const tripConfigRepository = require('../repositories/tripConfigRepository');

const getTripConfigs = async (req, res) => {
    try {
        const configs = await tripConfigRepository.findAllActive();
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTripConfig = async (req, res) => {
    try {
        const updatedConfig = await tripConfigRepository.createOrUpdate(req.body);
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTripConfigs,
    updateTripConfig
};
