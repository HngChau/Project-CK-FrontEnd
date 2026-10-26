export interface Category {
  slug: string;
  name: string;
  rss: string;
}

/** Một bài báo đã chuẩn hóa từ RSS. */
export interface Article {
  id: string;
  title: string;
  link: string;
  image: string;
  summary: string;
  content: string;
  pubDate: string;
  category: string;
}

/** Bài viết đã lưu (chức năng mới 1, TV2). */
export interface BookmarkItem extends Article {
  savedAt: number;
  collection: string | null;
  note: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StoredUser extends User {
  salt: string;
  passHash: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherInfo {
  temp: number;
  code: number;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
