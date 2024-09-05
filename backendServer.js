const express = require('express');
const app = express();

// Sample data
const data = {
  message: 'This is data from the backend server!',
  timestamp: new Date(),
};

// Route to get data
app.get('/data', (req, res) => {
  console.log('Backend server received a request');
  res.json(data);
});

app.get('/data2', (req, res) => {
    console.log('Backend server received a request');
    res.json(data);
});

// Start the backend server
const port = 3001;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
