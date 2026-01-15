const authService = require('../services/authService');
const asyncHandler = require('express-async-handler');

const registerUser = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
});

const loginUser = asyncHandler(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.json(result);
});

const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
});

module.exports = {
    registerUser,
    loginUser,
    refreshToken
};