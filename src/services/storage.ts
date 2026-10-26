// Mọi dữ liệu của người dùng lưu theo khóa dt:<userId>:<key> để TV2 và TV3 không ghi đè nhau.
function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const readJSON = <T>(key: string, fallback: T): T =>
  safeParse<T>(localStorage.getItem(key), fallback);

export const writeJSON = <T>(key: string, value: T): void =>
  localStorage.setItem(key, JSON.stringify(value));

export const userKey = (userId: string, name: string): string => `dt:${userId}:${name}`;

export const readUser = <T>(userId: string, name: string, fallback: T): T =>
  readJSON<T>(userKey(userId, name), fallback);

export const writeUser = <T>(userId: string, name: string, value: T): void =>
  writeJSON<T>(userKey(userId, name), value);
