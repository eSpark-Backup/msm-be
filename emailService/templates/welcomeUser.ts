const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Load and compile the Handlebars template
const templatePath = path.join(__dirname, '../emails/welcomeUser.hbs');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateSource);

/**
 * Generate welcome user email HTML
 * @param {Object} data - Template data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.password - Temporary password
 * @param {string} data.loginUrl - Login URL
 * @returns {string} - Compiled HTML
 */
const generateWelcomeUserEmail = (data) => {
  const currentYear = new Date().getFullYear();
  
  return template({
    name: data.name || 'User',
    email: data.email,
    password: data.password,
    loginUrl: data.loginUrl || process.env.FRONTEND_URL,
    year: currentYear,
  });
};

module.exports = {
  generateWelcomeUserEmail,
};