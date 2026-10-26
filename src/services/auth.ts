// Đăng nhập giả lập phía client (không có server): người dùng lưu trong localStorage.
// Mật khẩu được băm SHA-256 + salt bằng Web Crypto (cần https hoặc localhost).
import type { LoginInput, RegisterInput, StoredUser, User } from '../types';
import { readJSON, writeJSON } from './storage';

const USERS_KEY = 'dt_users';
const SESSION_KEY = 'dt_session';

async function hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const toPublic = (u: StoredUser): User => ({ id: u.id, name: u.name, email: u.email });

export function getSessionUser(): User | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const u = readJSON<StoredUser[]>(USERS_KEY, []).find((x) => x.id === id);
  return u ? toPublic(u) : null;
}

export async function register({ name, email, password }: RegisterInput): Promise<User> {
  const users = readJSON<StoredUser[]>(USERS_KEY, []);
  const mail = email.trim().toLowerCase();
  if (users.some((u) => u.email === mail)) throw new Error('Email đã được đăng ký');
  if (password.length < 6) throw new Error('Mật khẩu tối thiểu 6 ký tự');
  const salt = crypto.randomUUID();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: mail,
    salt,
    passHash: await hash(password, salt),
  };
  writeJSON<StoredUser[]>(USERS_KEY, [...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return toPublic(user);
}

export async function login({ email, password }: LoginInput): Promise<User> {
  const mail = email.trim().toLowerCase();
  const user = readJSON<StoredUser[]>(USERS_KEY, []).find((u) => u.email === mail);
  if (!user || user.passHash !== (await hash(password, user.salt))) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return toPublic(user);
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
