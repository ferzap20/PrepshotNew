import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { jwtVerify, SignJWT } from 'jose';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = getCookie(c, 'token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { payload } = await jwtVerify(token, getSecret());
    c.set('user', payload as unknown as AuthUser);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
});
