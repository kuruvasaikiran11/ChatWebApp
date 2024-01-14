const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/temperatureDB');

// Create a mongoose model for the temperature data
const Temperature = mongoose.model('Temperature', {
  temperature: Number,
  batteryLevel: Number,
  timeStamp: String
});

// Endpoint to save random integer values into the database
app.post('/saveData', async (req, res) => {
  const { temperature, batteryLevel } = req.body;

  const newTemperature = new Temperature({
    temperature,
    batteryLevel,
    timeStamp: new Date().toLocaleDateString()
  });

  await newTemperature.save();

  res.json({ message: 'Data saved successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// Create a simple HTTP server
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server instance
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // You can add logic here to send initial data to the client if needed

  // WebSocket message handling
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});

// API endpoint to fetch historical data
app.get('/api/historicalData', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const historicalData = await Temperature.find({
      timeStamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
server.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});

app.get('/api/historicalData', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const historicalData = await Temperature.find({
      timeStamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    if (historicalData.length === 0) {
      res.status(404).json({ error: 'No historical data found for the selected date range.' });
    } else {
      res.json(historicalData);
    }
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});