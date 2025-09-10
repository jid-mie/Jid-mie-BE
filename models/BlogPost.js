const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    content: String,
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
}, { timestamps: true });

// Middleware to auto-update slug if title changes
BlogPostSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true, locale: 'vi' });
    }
    next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);