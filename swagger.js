const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Library API',
    description: 'A simple Express Library API',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js']; // Adjust according to your main server file

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./server.js'); // Start the server after generating the Swagger documentation
});
