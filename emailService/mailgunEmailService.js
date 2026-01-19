const { createMailgunClient } = require('./mailgunEmailClient');
const { generateForgetPasswordEmail } = require('./templates/forgetPassword');
const { generateWelcomeUserEmail } = require('./templates/welcomeUser');

/**
 * Send forget password email using Mailgun
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User's name
 * @param {string} options.resetLink - Password reset link
 * @param {number} options.expiryTime - Link expiry time in minutes (default: 30)
 * @returns {Promise<Object>} - Result object
 */
const sendForgetPasswordEmail = async (options) => {
  try {
    const mailgun = createMailgunClient();
    
    if (!mailgun) {
      throw new Error('Mailgun service not configured. Please add Mailgun credentials to .env file');
    }

    // Generate email HTML from template
    const html = generateForgetPasswordEmail({
      name: options.name,
      resetLink: options.resetLink,
      expiryTime: options.expiryTime || 30,
    });

    // Email data for Mailgun
    const data = {
      from: `${process.env.MAILGUN_FROM_NAME || 'MSM Support'} <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: options.to,
      subject: 'Reset Your Password - MSM',
      html: html,
    };

    // Send email via Mailgun
    const result = await mailgun.messages().send(data);
    
    console.log('✓ Forget password email sent via Mailgun:', result.id);
    
    return {
      success: true,
      messageId: result.id,
      message: 'Password reset email sent successfully via Mailgun',
    };
  } catch (error) {
    console.error('✗ Error sending forget password email via Mailgun:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send password reset email via Mailgun',
    };
  }
};

/**
 * Send generic email using Mailgun
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} - Result object
 */
const sendEmail = async (options) => {
  try {
    const mailgun = createMailgunClient();
    
    if (!mailgun) {
      throw new Error('Mailgun service not configured');
    }

    const data = {
      from: `${process.env.MAILGUN_FROM_NAME || 'MSM'} <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const result = await mailgun.messages().send(data);
    
    return {
      success: true,
      messageId: result.id,
      message: 'Email sent successfully via Mailgun',
    };
  } catch (error) {
    console.error('✗ Error sending email via Mailgun:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email via Mailgun',
    };
  }
};

/**
 * Send welcome email with credentials using Mailgun
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User's name
 * @param {string} options.password - Temporary password
 * @param {string} options.loginUrl - Login URL (optional)
 * @returns {Promise<Object>} - Result object
 */
const sendWelcomeEmail = async (options) => {
  try {
    const mailgun = createMailgunClient();
    
    if (!mailgun) {
      throw new Error('Mailgun service not configured. Please add Mailgun credentials to .env file');
    }

    // Generate email HTML from template
    const html = generateWelcomeUserEmail({
      name: options.name,
      email: options.to,
      password: options.password,
      loginUrl: options.loginUrl || process.env.FRONTEND_URL,
    });

    // Email data for Mailgun
    const data = {
      from: `${process.env.MAILGUN_FROM_NAME || 'MSM Support'} <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: options.to,
      subject: 'Welcome to MSM - Your Account Details',
      html: html,
    };

    // Send email via Mailgun
    const result = await mailgun.messages().send(data);
    
    console.log('✓ Welcome email sent via Mailgun:', result.id);
    
    return {
      success: true,
      messageId: result.id,
      message: 'Welcome email sent successfully via Mailgun',
    };
  } catch (error) {
    console.error('✗ Error sending welcome email via Mailgun:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send welcome email via Mailgun',
    };
  }
};

module.exports = {
  sendForgetPasswordEmail,
  sendEmail,
  sendWelcomeEmail,
};