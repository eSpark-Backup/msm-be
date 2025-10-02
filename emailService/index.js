const emailService = require('./emailService');
const emailClient = require('./emailClient');

module.exports = {
  ...emailService,
  verifyConnection: emailClient.verifyConnection,
};