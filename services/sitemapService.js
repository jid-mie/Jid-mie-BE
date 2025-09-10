const js2xml = require('xml-js');
const ServicePage = require('../models/ServicePage');
const BlogPost = require('../models/BlogPost');

const sitemapService = {
    generate: async () => {
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
        let urls = [];

        const servicePages = await ServicePage.find({ status: 'published' });
        servicePages.forEach(page => {
            urls.push({
                loc: { _text: `${baseUrl}/dich-vu/${page.slug}` },
                lastmod: { _text: new Date(page.updatedAt).toISOString() },
                priority: { _text: '0.9' }
            });
        });

        const blogPosts = await BlogPost.find({ status: 'published' });
        blogPosts.forEach(post => {
            urls.push({
                loc: { _text: `${baseUrl}/blog/${post.slug}` },
                lastmod: { _text: new Date(post.updatedAt).toISOString() },
                priority: { _text: '0.8' }
            });
        });

        const sitemapObject = {
            _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
            urlset: {
                _attributes: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' },
                url: urls
            }
        };

        return js2xml.js2xml(sitemapObject, { compact: true, spaces: 4 });
    }
};

module.exports = sitemapService;