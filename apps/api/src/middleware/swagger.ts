import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from '../config/env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CoffeeHubNepal API',
      version: '1.0.0',
      description: 'API documentation for CoffeeHubNepal platform - Connecting Nepal\'s coffee community',
      contact: {
        name: 'CoffeeHubNepal Support',
        email: 'support@coffeehubnepal.com',
      },
      license: {
        name: 'Private',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `https://${env.clientOrigin.replace(/^https?:\/\//, '')}` 
          : 'http://localhost:4000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /auth/login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error code',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            requestId: {
              type: 'string',
              description: 'Request ID for tracking',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['farmer', 'roaster', 'trader', 'exporter', 'expert', 'admin', 'moderator'] },
            phone: { type: 'string' },
            location: { type: 'string' },
            avatar: { type: 'string' },
            verified: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Blog', description: 'Blog posts and content' },
      { name: 'Products', description: 'Marketplace products' },
      { name: 'Jobs', description: 'Job board' },
      { name: 'Prices', description: 'Coffee price board' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Contacts', description: 'Contact form submissions' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CoffeeHubNepal API Documentation',
  }));
};
