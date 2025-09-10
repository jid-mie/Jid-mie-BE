const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// --- Service Pages Routes ---
router.route('/service-pages')
    .get(adminController.getAllServicePages)
    .post(adminController.createServicePage);

router.route('/service-pages/:id')
    .put(adminController.updateServicePage)
    .delete(adminController.deleteServicePage);

// --- Blog Posts Routes ---
router.route('/blog-posts')
    .get(adminController.getAllBlogPosts)
    .post(adminController.createBlogPost);

router.route('/blog-posts/:id')
    .put(adminController.updateBlogPost)
    .delete(adminController.deleteBlogPost);

// --- Redirects Routes ---
router.route('/redirects')
    .get(adminController.getAllRedirects)
    .post(adminController.createRedirect);

router.route('/redirects/:id')
    .delete(adminController.deleteRedirect);

module.exports = router;