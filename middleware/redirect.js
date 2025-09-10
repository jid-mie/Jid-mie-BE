const Redirect = require('../models/Redirect');

const redirectMiddleware = async (req, res, next) => {
    try {
        // Skip check for API routes
        if (req.path.startsWith('/api/')) {
            return next();
        }
        const redirectRule = await Redirect.findOne({ source_url: req.path });
        if (redirectRule) {
            console.log(`REDIRECTING: ${req.path} -> ${redirectRule.destination_url}`);
            return res.redirect(redirectRule.status_code, redirectRule.destination_url);
        }
        next();
    } catch (error) {
        console.error("Redirect middleware error:", error);
        next(); // Ensure request continues even if there's an error
    }
};

module.exports = redirectMiddleware;