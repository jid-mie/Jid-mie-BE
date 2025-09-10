const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    tripId: { type: String },
    bookingDate: { type: Date },
    departureTime: { type: String },
    vehicleType: { type: String },
    pickup: { type: String },
    destination: { type: String },
    seats: [{ type: String }],
    // Keep tripDetails for backward compatibility; make it optional
    tripDetails: { type: mongoose.Schema.Types.Mixed },
    // Use price as the canonical total amount
    price: { type: Number, required: true },
    // Some code/tests may still use `totalPrice` naming; keep it for compatibility
    totalPrice: { type: Number },
    status: { type: String, required: true, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

// Populate `price` from `totalPrice` when needed to preserve compatibility
bookingSchema.pre('validate', function (next) {
    if ((this.price === undefined || this.price === null) && (this.totalPrice !== undefined && this.totalPrice !== null)) {
        this.price = this.totalPrice;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);