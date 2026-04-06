import crypto from 'crypto';

// AES-256-CBC için 32 byte (256 bit) key gereklidir.
// Gerçek projede bunu .env dosyasından almalısınız.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef'; // 32 characters
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text) return text;

  const textParts = text.split(':');
  const ivPart = textParts.shift();
  if (!ivPart) return text;

  const iv = Buffer.from(ivPart, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
