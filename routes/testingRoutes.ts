const express = require('express');
const router = express.Router();
const { sendWelcomeEmail } = require('../emailService');
const crypto = require('crypto');
const User = require('../models/User');

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

router.get('/mailgun', async (req, res) => {
    try {
        const { sendWelcomeEmail } = require('../emailService/mailgunEmailService');
        
        const password = generateRandomPassword();
        const email = "taimoor7535@gmail.com";
        const name = "Mailgun Test User";

        // Test Mailgun welcome email
        const result = await sendWelcomeEmail({
            to: email,
            name,
            password,
            loginUrl: process.env.FRONTEND_URL,
        });

        if (result.success) {
            res.json({
                success: true,
                message: 'Mailgun test email sent successfully!',
                messageId: result.messageId,
                email: email,
                password: password
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send Mailgun test email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Mailgun test error:', error);
        res.status(500).json({
            success: false,
            message: 'Mailgun test failed',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    
    const password = generateRandomPassword();

    // const email = "tarmimi@indkom.com.my";

    // const name = "indkom-prod";

    const email = "syamir@indkom.com.my"

    const name = "indkom-qat"

    // update user password
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.password = password;
    await user.save();

    await sendWelcomeEmail({
        to: email,
        name,
        password,
        loginUrl: process.env.FRONTEND_URL,
    });

    res.send('Hello World!');
});


module.exports = router;