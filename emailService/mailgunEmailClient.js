const mailgun = require('mailgun-js');

const createMailgunClient = () => {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn('Mailgun configuration missing in .env file');
    return null;
  }

  return mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
};


module.exports = {
  createMailgunClient,
};