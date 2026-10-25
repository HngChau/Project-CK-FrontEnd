// Đăng nhập giả lập phía client (không có server): người dùng lưu trong localStorage.
// Mật khẩu được băm SHA-256 + salt bằng Web Crypto (cần https hoặc localhost).
import { readJSON, writeJSON } from './storage';

const USERS_KEY = 'dt_users';
const SESSION_KEY = 'dt_session';

async function hash(password, salt) {
  const data = new TextEncoder().encode(salt + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getSessionUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const u = readJSON(USERS_KEY, []).find((x) => x.id === id);
  return u ? { id: u.id, name: u.name, email: u.email } : null;
}

export async function register({ name, email, password }) {
  const users = readJSON(USERS_KEY, []);
  const mail = email.trim().toLowerCase();
  if (users.some((u) => u.email === mail)) throw new Error('Email đã được đăng ký');
  if (password.length < 6) throw new Error('Mật khẩu tối thiểu 6 ký tự');
  const salt = crypto.randomUUID();
  const user = { id: crypto.randomUUID(), name: name.trim(), email: mail, salt, passHash: await hash(password, salt) };
  writeJSON(USERS_KEY, [...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return { id: user.id, name: user.name, email: user.email };
}

export async function login({ email, password }) {
  const mail = email.trim().toLowerCase();
  const user = readJSON(USERS_KEY, []).find((u) => u.email === mail);
  if (!user || user.passHash !== (await hash(password, user.salt))) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return { id: user.id, name: user.name, email: user.email };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
