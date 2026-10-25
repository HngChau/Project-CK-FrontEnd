import { CATEGORIES, getCategory } from '../config/categories';

// CORS: trình duyệt không gọi trực tiếp RSS của Dân trí được, nên đi qua proxy công cộng.
const XML_PROXY = 'https://api.allorigins.win/raw?url=';
const JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const TTL = 5 * 60 * 1000; // cache 5 phút

const feedCache = new Map(); // slug -> { time, items }
const articleCache = new Map(); // id -> article

export function articleId(link) {
  const m = link.match(/-(\d{8,})\.htm/);
  return m ? m[1] : btoa(unescape(encodeURIComponent(link))).replace(/[^a-z0-9]/gi, '').slice(-24);
}

export function removeAccents(s = '') {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

function normalize(raw, category) {
  const html = raw.description || '';
  const image =
    raw.thumbnail || (html.match(/<img[^>]+src=["']([^"']+)/i) || [])[1] || raw.enclosure?.link || '';
  const summary = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    id: articleId(raw.link),
    title: (raw.title || '').trim(),
    link: raw.link,
    image,
    summary,
    content: raw.content || '',
    pubDate: raw.pubDate,
    category,
  };
}

async function fetchViaXml(url) {
  const res = await fetch(XML_PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error('Proxy lỗi ' + res.status);
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
  return [...xml.querySelectorAll('item')].map((it) => ({
    title: it.querySelector('title')?.textContent,
    link: it.querySelector('link')?.textContent,
    description: it.querySelector('description')?.textContent,
    pubDate: it.querySelector('pubDate')?.textContent,
    enclosure: { link: it.querySelector('enclosure')?.getAttribute('url') },
  }));
}

// Dự phòng: rss2json (bản miễn phí chỉ trả khoảng 10 tin/feed)
async function fetchViaJson(url) {
  const res = await fetch(JSON_API + encodeURIComponent(url));
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message || 'rss2json lỗi');
  return data.items;
}

export async function getFeed(slug) {
  const cached = feedCache.get(slug);
  if (cached && Date.now() - cached.time < TTL) return cached.items;

  const cat = getCategory(slug);
  if (!cat) throw new Error('Chuyên mục không tồn tại');

  let rawItems;
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

export async function getAllFeeds() {
  const results = await Promise.allSettled(
    CATEGORIES.filter((c) => c.slug !== 'trang-chu').map((c) => getFeed(c.slug))
  );
  const seen = new Set();
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((a) => (seen.has(a.id) ? false : seen.add(a.id)))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

export async function getArticle(id, slug) {
  if (articleCache.has(id)) return articleCache.get(id);
  if (slug) await getFeed(slug).catch(() => {});
  if (!articleCache.has(id)) await getAllFeeds();
  return articleCache.get(id) || null;
}

export async function searchArticles(query) {
  const q = removeAccents(query.trim());
  if (!q) return [];
  const all = await getAllFeeds();
  return all.filter((a) => removeAccents(a.title + ' ' + a.summary).includes(q));
}

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return `${Math.max(1, Math.floor(diff))} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
}
