const express = require('express');
const router = express.Router();
const { sendWelcomeEmail } = require('../emailService');
const crypto = require('crypto');

// Generate random password
const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    return password;
};


router.get('/', async (req, res) => {
    const password = generateRandomPassword();

    // const email = "tarmimi@indkom.com.my";

    // const name = "indkom-prod";

    const email = "syamir@indkom.com.my"

    const name = "indkom-qat"

    await sendWelcomeEmail({
        to: email,
        name,
        password,
        loginUrl: process.env.FRONTEND_URL,
    });

    res.send('Hello World!');
});


module.exports = router;