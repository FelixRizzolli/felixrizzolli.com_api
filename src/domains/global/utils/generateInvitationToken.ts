import crypto from 'crypto';

/**
 * Generates a random alphanumeric invitation token.
 *
 * Uses Node.js `crypto.randomBytes` for cryptographically secure randomness.
 * This utility runs exclusively on the server (Payload admin field component),
 * so the Node.js `crypto` module is always available.
 *
 * @param length - Number of characters in the token (default: 6)
 */
export default function generateInvitationToken(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
