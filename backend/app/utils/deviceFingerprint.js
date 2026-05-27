import crypto from 'crypto';

export const generateDeviceFingerprint = (req) => {
  const raw = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.ip
  ].join('|');

  return crypto
    .createHash('sha256')
    .update(raw)
    .digest('hex');
};