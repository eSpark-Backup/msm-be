require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const telemetryRoutes = require('./routes/telemetryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
require('./connect');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/msm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/devices', deviceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  mqttClient.end();
  mongoose.connection.close();
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
