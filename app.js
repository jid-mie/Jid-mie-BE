const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet'); // Security headers
const morgan = require('morgan'); // Logging
const swaggerUi = require('swagger-ui-express'); // Swagger UI
const swaggerSpecs = require('./config/swagger'); // Swagger Specs
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
app.use(helmet()); // Security Headers
app.use(morgan('dev')); // Logger
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Rate Limiting: 100 req / 15 min
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter); // Apply to API routes only

app.use(express.static('public'));

// Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

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
