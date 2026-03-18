import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { createUser, findUserByEmail, findUserById } from '../models/userModel';
import type { User } from '@crypto-saas/shared';

export interface TokenPayload {
  userId: string;
  email: string;
  tier: User['tier'];
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, tier: user.tier } as TokenPayload,
    config.jwtSecret,
    { expiresIn: '7d' }
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
