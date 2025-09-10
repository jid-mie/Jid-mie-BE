const slugify = require('slugify');
const ServicePage = require('../models/ServicePage');
const BlogPost = require('../models/BlogPost');
const Redirect = require('../models/Redirect');

const createSlug = (title) => slugify(title, { lower: true, strict: true, locale: 'vi' });

const adminController = {
    // SERVICE PAGE MANAGEMENT
    getAllServicePages: async (req, res) => {
        try {
            const pages = await ServicePage.find().sort({ createdAt: -1 });
            res.json(pages);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    createServicePage: async (req, res) => {
        try {
            const { title } = req.body;
            if (!title) return res.status(400).json({ message: 'Title is required' });
            const newPage = new ServicePage({ ...req.body, slug: createSlug(title) });
            await newPage.save();
            res.status(201).json(newPage);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    updateServicePage: async (req, res) => {
        try {
            if (req.body.title) { req.body.slug = createSlug(req.body.title); }
            const updatedPage = await ServicePage.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedPage) return res.status(404).json({ message: 'Page not found' });
            res.json(updatedPage);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    deleteServicePage: async (req, res) => {
        try {
            const deletedPage = await ServicePage.findByIdAndDelete(req.params.id);
            if (!deletedPage) return res.status(404).json({ message: 'Page not found' });
            res.json({ message: 'Page deleted successfully' });
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },

    // BLOG POST MANAGEMENT
    getAllBlogPosts: async (req, res) => {
        try {
            const posts = await BlogPost.find().sort({ createdAt: -1 });
            res.json(posts);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    createBlogPost: async (req, res) => {
        try {
            const { title } = req.body;
            if (!title) return res.status(400).json({ message: 'Title is required' });
            const newPost = new BlogPost({ ...req.body, slug: createSlug(title) });
            await newPost.save();
            res.status(201).json(newPost);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    updateBlogPost: async (req, res) => {
        try {
            if (req.body.title) { req.body.slug = createSlug(req.body.title); }
            const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
            res.json(updatedPost);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    deleteBlogPost: async (req, res) => {
        try {
            const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
            if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
            res.json({ message: 'Post deleted successfully' });
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },

    // REDIRECT MANAGEMENT
    getAllRedirects: async (req, res) => {
        try {
            const redirects = await Redirect.find().sort({ _id: -1 });
            res.json(redirects);
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
    createRedirect: async (req, res) => {
        try {
            const { source_url, destination_url } = req.body;
            if (!source_url || !destination_url) return res.status(400).json({ message: 'Source and Destination URLs are required' });
            const newRedirect = new Redirect(req.body);
            await newRedirect.save();
            res.status(201).json(newRedirect);
        } catch (error) {
            if (error.code === 11000) return res.status(409).json({ message: `Source URL '${req.body.source_url}' already exists.` });
            res.status(500).json({ message: 'Server error', error });
        }
    },
    deleteRedirect: async (req, res) => {
        try {
            const deletedRedirect = await Redirect.findByIdAndDelete(req.params.id);
            if (!deletedRedirect) return res.status(404).json({ message: 'Redirect rule not found' });
            res.json({ message: 'Redirect rule deleted successfully' });
        } catch (error) { res.status(500).json({ message: 'Server error', error }); }
    },
};

module.exports = adminController;