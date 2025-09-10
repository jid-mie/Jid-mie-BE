const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

// --- MIDDLEWARES & ROUTES ---
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const redirectMiddleware = require('./middleware/redirect');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 });
app.use(limiter);
app.use(express.static('public'));

// --- PASSPORT INITIALIZATION ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret_for_development',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/trips', tripRoutes);

// --- ERROR HANDLING MIDDLEWARES ---
app.use(notFound);
app.use(errorHandler);

module.exports = app; // <-- Xuất khẩu ứng dụng đã được cấu hình
