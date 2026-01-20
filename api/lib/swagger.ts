import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VaporPOS API',
      version: '1.0.0',
      description: 'Point of Sale API dengan multi-tenant support',
      contact: {
        name: 'API Support',
        email: 'support@vaporapos.com'
      }
    },
    servers: [
      {
        url: process.env.VITE_API_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./api/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
