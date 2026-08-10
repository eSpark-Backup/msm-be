const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Load and compile the Handlebars template
const templatePath = path.join(__dirname, '../emails/forgetPassword.hbs');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateSource);

/**
 * Generate forget password email HTML
 * @param {Object} data - Template data
 * @param {string} data.name - User's name
 * @param {string} data.resetLink - Password reset link
 * @param {number} data.expiryTime - Link expiry time in minutes
 * @returns {string} - Compiled HTML
 */
const generateForgetPasswordEmail = (data) => {
  const currentYear = new Date().getFullYear();
  
  return template({
    name: data.name || 'User',
    resetLink: data.resetLink,
    expiryTime: data.expiryTime || 30,
    year: currentYear,
  });
};

module.exports = {
  generateForgetPasswordEmail,
};