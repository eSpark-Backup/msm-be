const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email configuration missing in .env file');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Verify connection configuration
const verifyConnection = async () => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email configuration missing' };
  }

  try {
    await transporter.verify();
    console.log('✓ Email server is ready to send messages');
    return { success: true, message: 'Email server connected' };
  } catch (error) {
    console.error('✗ Email server connection failed:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createTransporter,
  verifyConnection,
};