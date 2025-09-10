const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Route to serve content for frontend pages
// e.g., GET /api/pages/dich-vu-taxi-4-cho-ha-noi
router.get('/pages/:slug', publicController.getPageBySlug);

// Route to provide sitemap.xml
router.get('/sitemap.xml', publicController.getSitemap);

module.exports = router;