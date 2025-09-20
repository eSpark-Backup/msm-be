require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const telemetryRoutes = require('./routes/telemetryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const userRoutes = require('./routes/userRoutes');
const mqttRoutes = require('./routes/mqttRoutes');
const sftpRoutes = require('./routes/sftpRoutes');
const ntpRoutes = require('./routes/ntpRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const groupRoutes = require('./routes/groupRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const socketService = require('./sockets/socket');

const app = express();
const PORT = process.env.PORT || 5000;


// Create HTTP server
const server = require('http').createServer(app);

// Initialize socket.io
socketService.init(server);

// Initialize fleetConnect
const fleetConnect = require('./fleetConnect');
fleetConnect.connect();

app.use(cors({
  origin: '*'
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  mongoose.connection.close();
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
