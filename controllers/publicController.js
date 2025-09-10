const ServicePage = require('../models/ServicePage');
const BlogPost = require('../models/BlogPost');
const sitemapService = require('../services/sitemapService');

const publicController = {
    getPageBySlug: async (req, res) => {
        try {
            const { slug } = req.params;
            let page = await ServicePage.findOne({ slug, status: 'published' });
            if (page) return res.json(page);

            page = await BlogPost.findOne({ slug, status: 'published' });
            if (page) return res.json(page);

            return res.status(404).json({ message: 'Page not found' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    },

    getSitemap: async (req, res) => {
        try {
            const sitemap = await sitemapService.generate();
            res.header('Content-Type', 'application/xml');
            res.send(sitemap);
        } catch (error) {
            console.error('Sitemap generation error:', error);
            res.status(500).send('Error generating sitemap');
        }
    }
};

module.exports = publicController;