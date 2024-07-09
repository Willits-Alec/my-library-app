const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API endpoints',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Replace with your server URL
        description: 'Development server',
      },
    ],
  },
  apis: [path.resolve(__dirname, './routes/*.js')], // Path to your API route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
