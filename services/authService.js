const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10m' });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async ({ name, email, password }) => {
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
        throw new AppError(400, 'Email đã tồn tại');
    }

    const user = await userRepository.create({ name, email, password });
    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        };
    } else {
        throw new AppError(400, 'Dữ liệu người dùng không hợp lệ');
    }
};

const loginUser = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        };
    } else {
        throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    }
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError(401, 'Không có Refresh Token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
        // Kiểm tra user còn tồn tại không
        const user = await userRepository.findById(decoded.id);
        if (!user) {
            throw new AppError(401, 'Người dùng không tồn tại');
        }

        // Cấp lại Access Token mới (10 phút)
        const newAccessToken = generateToken(user._id);
        return { token: newAccessToken };
    } catch (error) {
        throw new AppError(403, 'Refresh Token không hợp lệ hoặc đã hết hạn');
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken
};
