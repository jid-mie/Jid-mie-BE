const mongoose = require('mongoose');

const RedirectSchema = new mongoose.Schema({
    source_url: { type: String, required: true, unique: true, index: true, trim: true },
    destination_url: { type: String, required: true, trim: true },
    status_code: { type: Number, default: 301 }
});

module.exports = mongoose.model('Redirect', RedirectSchema);