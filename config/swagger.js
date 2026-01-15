const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Jid-mie Booking API',
            version: '1.0.0',
            description: 'API documentation for Jid-mie Booking System',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Đường dẫn đến các file chứa annotation swagger (routes)
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
