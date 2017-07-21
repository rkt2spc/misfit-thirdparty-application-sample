// Dependencies (Please Ignore)
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const yamlConfig = require('node-yaml-config');

// Immutable Global Configuration
// Configs are loaded based on NODE_ENV environment variable
global.Config = Object.freeze({
  misfit: yamlConfig.load('config/misfit.yaml', process.env.NODE_ENV || 'development'),
});

// Log out config in case you need to see what it looks like
// console.log(Config);

// Express Application
// http://expressjs.com/
const app = express();

// Make app log http access (request method, request url, response status, response time)
app.use(morgan('dev'));

// Make app understand these Content-Type: text/plain + application/json + application/x-www-form-urlencoded
app.use(bodyParser.text()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make app handle request per route
// For a full list of endpoint that this application handle
// refer to the router.js file
app.use(require('./router'));

// Error handler for when bad thing happen
app.use((error, request, response, next) => {
  console.log(error);
  response.status(500).end(error.message);
});

// HTTP Server
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => console.log('Server is listening on', `http://localhost:${PORT}`));