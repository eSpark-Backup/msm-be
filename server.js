require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const telemetryRoutes = require('./routes/telemetryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const userRoutes = require('./routes/userRoutes');
const mqttRoutes = require('./routes/mqttRoutes');
const sftpRoutes = require('./routes/sftpRoutes');
const ntpRoutes = require('./routes/ntpRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const groupRoutes = require('./routes/groupRoutes');

require('./fleetConnect');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*'
}));

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
app.use('/api/users', userRoutes);
app.use('/api/mqtt', mqttRoutes);
app.use('/api/sftp', sftpRoutes);
app.use('/api/ntp', ntpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/groups', groupRoutes);

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
