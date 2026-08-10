const emailService = require('./mailgunEmailService');
const emailClient = require('./mailgunEmailClient');

module.exports = {
  ...emailService,
  verifyConnection: emailClient.verifyConnection,
};