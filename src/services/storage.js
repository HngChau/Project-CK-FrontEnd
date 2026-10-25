// Mọi dữ liệu của người dùng lưu theo khóa dt:<userId>:<key> để TV2 và TV3 không ghi đè nhau.
const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const readJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
export const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const userKey = (userId, name) => `dt:${userId}:${name}`;
export const readUser = (userId, name, fallback) => readJSON(userKey(userId, name), fallback);
export const writeUser = (userId, name, value) => writeJSON(userKey(userId, name), value);
