const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const yargs = require('yargs');

// Set up CLI arguments for port and origin
const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'Port to run the caching proxy server on',
    type: 'number',
    default: 3000,
  })
  .option('origin', {
    alias: 'o',
    description: 'Backend server URL',
    type: 'string',
    default: 'http://localhost:3001',  // Default to your backend server
  })
  .help()
  .alias('help', 'h')
  .argv;

// Create an Express app
const app = express();
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Function to generate a cache key
const generateCacheKey = (req) => `${req.method}-${req.originalUrl}`;

// Middleware to handle caching and forwarding requests to the backend
app.use(async (req, res, next) => {
  const cacheKey = generateCacheKey(req);
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    console.log('Cache hit:', cacheKey);
    return res.json(cachedResponse);  // Return the cached response
  } else {
    console.log('Cache miss:', cacheKey);
    try {
      // Forward the request to the backend server
      const response = await axios({
        method: req.method,
        url: `${argv.origin}${req.originalUrl}`,
        headers: { ...req.headers },
      });

      // Cache the backend response
      cache.set(cacheKey, response.data);

      // Return the response from the backend
      return res.json(response.data);
    } catch (error) {
      return res.status(500).send('Error fetching data from backend server');
    }
  }
});

// Start the caching proxy server
app.listen(argv.port, () => {
  console.log(`Caching proxy server running on port ${argv.port}`);
  console.log(`Forwarding requests to: ${argv.origin}`);
});
