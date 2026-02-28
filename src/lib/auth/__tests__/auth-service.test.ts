import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openTestDB } from '@/test/open-test-db';

// Mock bcryptjs so tests don't spend time on 10-round hashing
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(async (pwd: string) => `hashed:${pwd}`),
    compare: vi.fn(async (pwd: string, hash: string) => hash === `hashed:${pwd}`),
  },
}));

// Mock the DB connection to return a fresh test DB each time
vi.mock('@/lib/db/connection', () => ({
  getDB: vi.fn(),
}));

import { getDB } from '@/lib/db/connection';
import { register, login, getSession, logout } from '../auth-service';

beforeEach(async () => {
  const testDB = await openTestDB();
  vi.mocked(getDB).mockResolvedValue(testDB as never);
  localStorage.clear();
});

describe('register', () => {
  it('creates a user and returns a User object', async () => {
    const user = await register('test@example.com', 'password123');
    expect(user.email).toBe('test@example.com');
    expect(user.id).toBeTruthy();
    expect(user.passwordHash).toBe('hashed:password123');
    expect(user.role).toBe('user');
  });

  it('throws if the email is already registered', async () => {
    await register('dup@example.com', 'pass123');
    await expect(register('dup@example.com', 'other123')).rejects.toThrow('Email already registered');
  });

  it('throws if the password is shorter than 6 characters', async () => {
    await expect(register('short@example.com', 'abc')).rejects.toThrow(
      'Password must be at least 6 characters',
    );
  });
});

describe('login', () => {
  it('returns an AuthSession and saves it to localStorage', async () => {
    await register('login@example.com', 'mypassword');
    const session = await login('login@example.com', 'mypassword');

    expect(session.email).toBe('login@example.com');
    expect(session.userId).toBeTruthy();
    expect(session.role).toBe('user');

    const stored = localStorage.getItem('prepshot_session');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).email).toBe('login@example.com');
  });

  it('throws if the email does not exist', async () => {
    await expect(login('nobody@example.com', 'pass')).rejects.toThrow('Invalid credentials');
  });

  it('throws if the password is incorrect', async () => {
    await register('pass@example.com', 'correct123');
    await expect(login('pass@example.com', 'wrong123')).rejects.toThrow('Invalid credentials');
  });
});

describe('getSession', () => {
  it('returns null when localStorage is empty', () => {
    expect(getSession()).toBeNull();
  });

  it('returns the parsed session when valid JSON is stored', async () => {
    await register('sess@example.com', 'pass123');
    await login('sess@example.com', 'pass123');

    const session = getSession();
    expect(session).not.toBeNull();
    expect(session!.email).toBe('sess@example.com');
  });

  it('returns null when localStorage contains invalid JSON', () => {
    localStorage.setItem('prepshot_session', 'not-valid-json{{{');
    expect(getSession()).toBeNull();
  });
});

describe('logout', () => {
  it('removes the session from localStorage', async () => {
    await register('out@example.com', 'pass123');
    await login('out@example.com', 'pass123');

    expect(localStorage.getItem('prepshot_session')).not.toBeNull();
    logout();
    expect(localStorage.getItem('prepshot_session')).toBeNull();
  });
});
