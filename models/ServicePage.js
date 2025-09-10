const mongoose = require('mongoose');
const slugify = require('slugify');

const ServicePageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    content: String,
    featured_image: { type: String, trim: true },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
    canonical_url: { type: String, trim: true },
    og_image: { type: String, trim: true },
    schema_data: Object,
}, { timestamps: true });

// Middleware to auto-update slug if title changes
ServicePageSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true, locale: 'vi' });
    }
    next();
});

module.exports = mongoose.model('ServicePage', ServicePageSchema);