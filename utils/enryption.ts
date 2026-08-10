const crypto = require('crypto');

// ENC_KEY=loremipsumdolorsitamet1234567890
// IV_LENGTH=16

const ENCRYPTION_KEY = process.env.ENC_KEY;
const IV_LENGTH = parseInt(process.env.IV_LENGTH, 10);

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const decrypt = (text) => {
    const iv = Buffer.from(text.split(':')[0], 'hex');
    const encryptedText = Buffer.from(text.split(':')[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {
    encrypt,
    decrypt
}
