import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { createUser, findUserByEmail, findUserById, updateUserPassword } from '../models/userModel';
import type { User } from '@crypto-saas/shared';

// In-memory reset token store (tokens expire after 1 hour)
const resetTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();

export interface TokenPayload {
  userId: string;
  email: string;
  tier: User['tier'];
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, tier: user.tier } as TokenPayload,
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

export async function register(email: string, password: string, displayName: string): Promise<{ user: User; token: string }> {
  const existing = findUserByEmail(email);
  if (existing) throw new Error('Email already registered');

  if (password.length < 8) throw new Error('Password must be at least 8 characters');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = createUser(email, passwordHash, displayName);
  const token = generateToken(user);

  return { user, token };
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const userWithHash = findUserByEmail(email);
  if (!userWithHash) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(password, userWithHash.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  const user: User = {
    id: userWithHash.id,
    email: userWithHash.email,
    displayName: userWithHash.displayName,
    tier: userWithHash.tier,
    createdAt: userWithHash.createdAt,
  };

  const token = generateToken(user);
  return { user, token };
}

export function getProfile(userId: string): User | undefined {
  return findUserById(userId);
}

export function requestPasswordReset(email: string): { message: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, {
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  // Clean up expired tokens
  for (const [key, val] of resetTokens.entries()) {
    if (val.expiresAt < Date.now()) resetTokens.delete(key);
  }

  // TODO: Send token via email (SendGrid/SES). Never return token in API response.
  console.log(`[SECURITY] Password reset token generated for ${email}`);

  return { message: 'If an account with that email exists, a reset link has been sent.' };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ user: User; token: string }> {
  const entry = resetTokens.get(token);
  if (!entry) throw new Error('Invalid or expired reset token');
  if (entry.expiresAt < Date.now()) {
    resetTokens.delete(token);
    throw new Error('Reset token has expired');
  }

  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  updateUserPassword(entry.userId, passwordHash);
  resetTokens.delete(token);

  const user = findUserById(entry.userId);
  if (!user) throw new Error('User not found');

  const authToken = generateToken(user);
  return { user, token: authToken };
}
