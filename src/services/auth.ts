// Đăng nhập giả lập phía client (không có server): người dùng lưu trong localStorage.
// Mật khẩu được băm SHA-256 + salt bằng Web Crypto (cần https hoặc localhost).
import type { LoginInput, RegisterInput, StoredUser, User } from '../types';
import { readJSON, writeJSON } from './storage';

const USERS_KEY = 'dt_users';
const SESSION_KEY = 'dt_session';

export type AuthField = 'name' | 'email' | 'password' | 'form';

export class AuthError extends Error {
    field: AuthField;
    constructor(message: string, field: AuthField = 'form') {
        super(message);
        this.name = 'AuthError';
        this.field = field;
    }
}

export type FormErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 20;
export const NAME_MAX = 50;

export function validatePassword(password: string): string {
    if (!password) return 'Vui lòng nhập mật khẩu';
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        return `Mật khẩu phải từ ${PASSWORD_MIN} đến ${PASSWORD_MAX} ký tự`;
    }
    return '';
}
export function validateEmail(email: string): string {
    const value = normalizeEmail(email);
    if (!value) return 'Vui lòng nhập email';
    if (!EMAIL_RE.test(value)) return 'Email không hợp lệ';
    return '';
}

export function validateLoginForm({ email, password }: LoginInput): FormErrors {
    const errors: FormErrors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    return errors;
}

export function validateName(name: string): string {
    if (name.trim().length > NAME_MAX) return 'Họ và tên nhập quá giới hạn ký tự cho phép';
    return '';
}

export function validateRegisterForm({ name, email, password }: RegisterInput): FormErrors {
    const errors: FormErrors = {};
    const nameError = validateName(name);
    if (nameError) errors.name = nameError;
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    return errors;
}

async function hash(password: string, salt: string): Promise<string> {
    if (!globalThis.crypto?.subtle) {
        throw new AuthError('Trình duyệt không hỗ trợ mã hóa. Hãy chạy bằng localhost hoặc https');
    }
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
    if (!u) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
    return toPublic(u);
}

export async function register({ name, email, password }: RegisterInput): Promise<User> {
    const errors = validateRegisterForm({ name, email, password });
    if (errors.name) throw new AuthError(errors.name, 'name');
    if (errors.email) throw new AuthError(errors.email, 'email');
    if (errors.password) throw new AuthError(errors.password, 'password');

    const users = readJSON<StoredUser[]>(USERS_KEY, []);
    const mail = normalizeEmail(email);
    if (users.some((u) => u.email === mail)) {
        throw new AuthError('Email đã được đăng ký', 'email');
    }

    const salt = crypto.randomUUID();
    const user: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: mail,
        salt,
        passHash: await hash(password, salt),
    };
    try {
        writeJSON<StoredUser[]>(USERS_KEY, [...users, user]);
    } catch {
        throw new AuthError('Không thể lưu tài khoản, vui lòng kiểm tra bộ nhớ trình duyệt', 'form');
    }
    return toPublic(user);
}

export async function login({ email, password }: LoginInput): Promise<User> {
    const errors = validateLoginForm({ email, password });
    if (errors.email) throw new AuthError(errors.email, 'email');
    if (errors.password) throw new AuthError(errors.password, 'password');

    const mail = normalizeEmail(email);
    const user = readJSON<StoredUser[]>(USERS_KEY, []).find((u) => u.email === mail);
    if (!user || user.passHash !== (await hash(password, user.salt))) {
        throw new AuthError('Email hoặc mật khẩu không đúng', 'form');
    }
    localStorage.setItem(SESSION_KEY, user.id);
    return toPublic(user);
}

export function logout(): void {
    localStorage.removeItem(SESSION_KEY);
}