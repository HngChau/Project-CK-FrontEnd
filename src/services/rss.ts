import { CATEGORIES, getCategory } from '../config/categories';
import type { Article } from '../types';

// CORS: trình duyệt không gọi trực tiếp RSS của Dân trí được, nên đi qua proxy công cộng.
const XML_PROXY = 'https://api.allorigins.win/raw?url=';
const JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const TTL = 5 * 60 * 1000; // cache 5 phút

/** Một mục RSS thô, trước khi chuẩn hóa. */
interface RawItem {
  title?: string | null;
  link?: string | null;
  description?: string | null;
  pubDate?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  enclosure?: { link?: string | null } | null;
}

interface Rss2JsonResponse {
  status: string;
  message?: string;
  items: RawItem[];
}

interface CachedFeed {
  time: number;
  items: Article[];
}

const feedCache = new Map<string, CachedFeed>(); // slug -> feed
const articleCache = new Map<string, Article>(); // id -> bài viết

export function articleId(link: string): string {
  const m = link.match(/-(\d{8,})\.htm/);
  if (m) return m[1];
  let h = 0;
  for (const ch of link) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
  return 'h' + Math.abs(h).toString(36);
}

export function removeAccents(s = ''): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function normalize(raw: RawItem, category: string): Article {
  const link = raw.link ?? '';
  const html = raw.description ?? '';
  const image = raw.thumbnail || html.match(/<img[^>]+src=["']([^"']+)/i)?.[1] || raw.enclosure?.link || '';
  const summary = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    id: articleId(link),
    title: (raw.title ?? '').trim(),
    link,
    image,
    summary,
    content: raw.content ?? '',
    pubDate: raw.pubDate ?? '',
    category,
  };
}

async function fetchViaXml(url: string): Promise<RawItem[]> {
  const res = await fetch(XML_PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error('Proxy lỗi ' + res.status);
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
  return Array.from(xml.querySelectorAll('item')).map((it) => ({
    title: it.querySelector('title')?.textContent,
    link: it.querySelector('link')?.textContent,
    description: it.querySelector('description')?.textContent,
    pubDate: it.querySelector('pubDate')?.textContent,
    enclosure: { link: it.querySelector('enclosure')?.getAttribute('url') },
  }));
}

// Dự phòng: rss2json (bản miễn phí chỉ trả khoảng 10 tin/feed)
async function fetchViaJson(url: string): Promise<RawItem[]> {
  const res = await fetch(JSON_API + encodeURIComponent(url));
  const data = (await res.json()) as Rss2JsonResponse;
  if (data.status !== 'ok') throw new Error(data.message || 'rss2json lỗi');
  return data.items;
}

export async function getFeed(slug: string): Promise<Article[]> {
  const cached = feedCache.get(slug);
  if (cached && Date.now() - cached.time < TTL) return cached.items;

  const cat = getCategory(slug);
  if (!cat) throw new Error('Chuyên mục không tồn tại');

  let rawItems: RawItem[];
  try {
    rawItems = await fetchViaXml(cat.rss);
    if (!rawItems.length) throw new Error('Feed rỗng');
  } catch {
    rawItems = await fetchViaJson(cat.rss);
  }
  const items = rawItems.filter((r) => r.link).map((r) => normalize(r, slug));
  items.forEach((a) => articleCache.set(a.id, a));
  feedCache.set(slug, { time: Date.now(), items });
  return items;
}

export async function getAllFeeds(): Promise<Article[]> {
  const results = await Promise.allSettled(
    CATEGORIES.filter((c) => c.slug !== 'trang-chu').map((c) => getFeed(c.slug))
  );
  const seen = new Set<string>();
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export async function getArticle(id: string, slug?: string | null): Promise<Article | null> {
  const hit = articleCache.get(id);
  if (hit) return hit;
  if (slug) await getFeed(slug).catch(() => undefined);
  if (!articleCache.has(id)) await getAllFeeds();
  return articleCache.get(id) ?? null;
}

export async function searchArticles(query: string): Promise<Article[]> {
  const q = removeAccents(query.trim());
  if (!q) return [];
  const all = await getAllFeeds();
  return all.filter((a) => removeAccents(a.title + ' ' + a.summary).includes(q));
}

export function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return `${Math.max(1, Math.floor(diff))} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
}
