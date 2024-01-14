const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect("mongodb+srv://kuruvasaikiran11:Kurnool123@cluster0.z1ij6vp.mongodb.net/temperatureDB");
const db = mongoose.connection;

// Define a schema for the data
const dataSchema = new mongoose.Schema({
  temperature: Number,
  batteryLevel: Number,
  timeStamp: { type: Date, default: Date.now },
});

const Data = mongoose.model("Data", dataSchema);

// Save random data every 5 seconds
// setInterval(async () => {
//   try {
//     const newData = new Data({
//       temperature: Math.floor(Math.random() * 100),
//       batteryLevel: Math.floor(Math.random() * 100),
//     });

//     await newData.save();

//     io.emit("newData", newData);
//     // console.log('Data saved:', newData);
//   } catch (error) {
//     console.error("Error saving data:", error);
//   }
// }, 5000);

// Serve static files
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// API to fetch latest 20 records
app.get('/api/latest', async (req, res) => {
  try {
    const latestData = await Data.find().sort({ timeStamp: 'desc' }).limit(20);
    res.json(latestData);
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.get("/api/latest", (req, res) => {
//   res.sendFile(__dirname + "/public/latestrecords.html");
// });

app.get('/api/data', async (req, res) => {
    try {
      const { start, end } = req.query;
  
      // Parse start and end date strings to Date objects
      const startDate = new Date(start);
      const endDate = new Date(end);
  
      const historicalData = await Data.find({
        timeStamp: { $gte: startDate, $lte: endDate },
      }).sort({ timeStamp: 'asc' });
  
      res.json(historicalData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
