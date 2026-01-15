const User = require('../models/User');

const findByEmail = async (email) => {
    return await User.findOne({ email });
};

const create = async (userData) => {
    return await User.create(userData);
};

const findById = async (id) => {
    return await User.findById(id);
};

module.exports = {
    findByEmail,
    create,
    findById
};
