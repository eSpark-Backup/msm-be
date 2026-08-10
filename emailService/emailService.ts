const { createTransporter } = require('./emailClient');
const { generateForgetPasswordEmail } = require('./templates/forgetPassword');
const { generateWelcomeUserEmail } = require('./templates/welcomeUser');

/**
 * Send forget password email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User's name
 * @param {string} options.resetLink - Password reset link
 * @param {number} options.expiryTime - Link expiry time in minutes (default: 30)
 * @returns {Promise<Object>} - Result object
 */
const sendForgetPasswordEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email service not configured. Please add email credentials to .env file');
    }

    // Generate email HTML from template
    const html = generateForgetPasswordEmail({
      name: options.name,
      resetLink: options.resetLink,
      expiryTime: options.expiryTime || 30,
    });

    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'MSM Support'}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: 'Reset Your Password - MSM',
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✓ Forget password email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Password reset email sent successfully',
    };
  } catch (error) {
    console.error('✗ Error sending forget password email:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send password reset email',
    };
  }
};

/**
 * Send generic email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} - Result object
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'MSM'}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('✗ Error sending email:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email',
    };
  }
};


/**
 * Send welcome email with credentials
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - User's name
 * @param {string} options.password - Temporary password
 * @param {string} options.loginUrl - Login URL (optional)
 * @returns {Promise<Object>} - Result object
 */
const sendWelcomeEmail = async (options) => {
    try {
      const transporter = createTransporter();
      
      if (!transporter) {
        throw new Error('Email service not configured. Please add email credentials to .env file');
      }
  
      // Generate email HTML from template
      const html = generateWelcomeUserEmail({
        name: options.name,
        email: options.to,
        password: options.password,
        loginUrl: options.loginUrl || process.env.FRONTEND_URL,
      });
  
      // Email options
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'MSM Support'}" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: 'Welcome to MSM - Your Account Details',
        html: html,
      };
  
      // Send email
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✓ Welcome email sent:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Welcome email sent successfully',
      };
    } catch (error) {
      console.error('✗ Error sending welcome email:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to send welcome email',
      };
    }
  };

module.exports = {
  sendForgetPasswordEmail,
  sendEmail,
  sendWelcomeEmail,
};