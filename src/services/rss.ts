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
const STORAGE_PREFIX = "dantri_rss_v2_";

function readStorage(slug: string): CachedFeed | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedFeed;

    if (
      !cached ||
      typeof cached.time !== "number" ||
      !Array.isArray(cached.items)
    ) {
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function saveCache(slug: string, items: Article[]) {
  const cached: CachedFeed = {
    time: Date.now(),
    items
  };

  feedCache.set(slug, cached);

  try {
    localStorage.setItem(
      STORAGE_PREFIX + slug,
      JSON.stringify(cached)
    );
  } catch (error) {
    console.warn("Không thể lưu localStorage:", error);
  }

  items.forEach(article => {
    articleCache.set(article.id, article);
  });
}

function getCachedFeed(slug: string): CachedFeed | null {
  const memoryCache = feedCache.get(slug);

  if (memoryCache) return memoryCache;

  const storageCache = readStorage(slug);

  if (storageCache) {
    feedCache.set(slug, storageCache);

    storageCache.items.forEach(article => {
      articleCache.set(article.id, article);
    });

    return storageCache;
  }

  return null;
}

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

async function fetchWithTimeout(url: string, timeout = 7000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('RSS quá thời gian phản hồi');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaXml(url: string): Promise<RawItem[]> {
  // const res = await fetch(XML_PROXY + encodeURIComponent(url));

  const res = await fetchWithTimeout(XML_PROXY + encodeURIComponent(url));
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

// Dự phòng: rss2json
async function fetchViaJson(url: string): Promise<RawItem[]> {
  const apiUrl =
    `${JSON_API}${encodeURIComponent(url)}&count=30`;
    
  // const res = await fetchWithTimeout(
  //   JSON_API + encodeURIComponent(url)
  // );

  const res = await fetchWithTimeout(apiUrl);

  const data = (await res.json()) as Rss2JsonResponse;
  if (data.status !== 'ok') throw new Error(data.message || 'rss2json lỗi');
  console.log('RSS2JSON trả về:', data.items.length, 'bài viết');
  return data.items;
}

//JSON khong tai duoc mơi dung hàm này
function getFallbackArticles(slug: string): Article[] {
  return [
    {
      id: `fallback-${slug}-1`,
      title: `Bản tin tổng hợp chuyên mục ${slug.toUpperCase()}`,
      link: '#',
      image: 'https://picsum.photos/800/450?random=' + slug.length,
      summary: 'Hệ thống đang hiển thị dữ liệu lưu trữ tạm thời do đường truyền RSS trực tuyến từ nhà cung cấp đang bảo trì.',
      content: 'Nội dung chi tiết đang được cập nhật.',
      pubDate: new Date().toUTCString(),
      category: slug,
    },
    {
      id: `fallback-${slug}-2`,
      title: `Cập nhật các thông tin và sự kiện mới trong ngày`,
      link: '#',
      image: 'https://picsum.photos/400/250?random=' + (slug.length + 1),
      summary: 'Nhiều tin tức quan trọng đã được hệ thống ghi nhận và phân loại theo đúng chuyên mục.',
      content: 'Nội dung chi tiết đang được cập nhật.',
      pubDate: new Date().toUTCString(),
      category: slug,
    },
    {
      id: `fallback-${slug}-3`,
      title: `Định hướng và các giải pháp triển khai trong thời gian tới`,
      link: '#',
      image: 'https://picsum.photos/400/250?random=' + (slug.length + 2),
      summary: 'Tổng hợp các thông tin phân tích chiều sâu phục vụ nhu cầu đọc tin tức của người dùng.',
      content: 'Nội dung chi tiết đang được cập nhật.',
      pubDate: new Date().toUTCString(),
      category: slug,
    }
  ];
}
const pendingRequests = new Map<string, Promise<Article[]>>();

let refreshQueue: Promise<void> = Promise.resolve();
// export async function getFeed(slug: string): Promise<Article[]> {
//   console.log('========== RSS DEBUG ==========');
//   console.log('Chuyên mục:', slug);
//   const cached = feedCache.get(slug);
//   if (cached && Date.now() - cached.time < TTL) {
//     console.log('ĐANG DÙNG CACHE:', cached.items.length);
//     return cached.items;
//   }
//   const pending = pendingRequests.get(slug);
//   if (pending) return pending;
//   const request =(async (): Promise<Article[]> => { 
//     const cat = getCategory(slug);
//     if (!cat) {
//       console.error('KHÔNG TÌM THẤY CATEGORY:', slug);
//       throw new Error('Chuyên mục không tồn tại');
//     }
//     console.log('RSS URL:', cat.rss);
//     let rawItems: RawItem[] = [];
//     // Thử AllOrigins
//     try {
//       console.log('ĐANG THỬ ALLORIGINS...');
//       rawItems = await fetchViaXml(cat.rss);
//       console.log('ALLORIGINS TRẢ VỀ:', rawItems);
//       if (!rawItems.length) {
//         throw new Error('RSS XML không có bài viết');
//       }
//     } catch (xmlError) {
//       console.warn('AllOrigins không phản hồi, chuyển sang RSS2JSON:',xmlError);
//       // Thử RSS2JSON
//       try {
//         console.log('ĐANG THỬ RSS2JSON...');
//         rawItems = await fetchViaJson(cat.rss);
//         console.log('RSS2JSON TRẢ VỀ:', rawItems);
//         if (!rawItems.length) {
//           throw new Error('RSS2JSON không có bài viết');
//         }
//       } catch (jsonError) {
//         console.error('RSS2JSON THẤT BẠI:', jsonError);
//         const fallback = getFallbackArticles(slug);
//         fallback.forEach(a => articleCache.set(a.id, a));
//         feedCache.set(slug, {
//           time: Date.now() - TTL + 30000,
//           items: fallback
//         });
//       console.warn('ĐANG HIỂN THỊ DỮ LIỆU MẪU');  
//       return fallback;
//     }
//   }
//   const items = rawItems.filter(item => item.link).map(item => normalize(item, slug));
//   if (!items.length) {
//     console.error('KHÔNG CHUẨN HÓA ĐƯỢC BÀI VIẾT');
//     return getFallbackArticles(slug);
//   }
//   items.forEach(a => articleCache.set(a.id, a));
//   feedCache.set(slug, {
//     time: Date.now(),
//     items
//   });

//   console.log('RSS THÀNH CÔNG:', items.length);
//   console.log('================================');

//   return items;
// })();
//   pendingRequests.set(slug, request);
//   try {
//     return await request;
//   } finally { 
//     pendingRequests.delete(slug);
//   }
// }


async function refreshFeed(slug: string): Promise<Article[]> {
  const pending = pendingRequests.get(slug);
  if (pending) return pending;

  // const request = (async (): Promise<Article[]> => {
    const request = refreshQueue.then(async (): Promise<Article[]> => {
    const cat = getCategory(slug);

    if (!cat) {
      throw new Error("Chuyên mục không tồn tại: " + slug);
    }

    let rawItems: RawItem[] = [];
    try {
      rawItems = await fetchViaXml(cat.rss);

      if (!rawItems.length) {
        throw new Error("RSS XML không có bài viết");
      }
    } catch (xmlError) {
      console.warn("AllOrigins lỗi, chuyển sang RSS2JSON:", xmlError);
      rawItems = await fetchViaJson(cat.rss);

      if (!rawItems.length) {
        throw new Error("RSS2JSON không có bài viết");
      }
    }
    const items = rawItems
      .filter(item => item.link)
      .slice(0, 30)
      .map(item => normalize(item, slug));

    if (!items.length) {
      throw new Error("Không chuẩn hóa được bài viết");
    }

    saveCache(slug, items);
    console.log("RSS cập nhật thành công:", slug, items.length);
    return items;
  });

  refreshQueue = request.then(
    () => undefined,
    () => undefined
  );

  pendingRequests.set(slug, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(slug);
  }
}

export async function getFeed(slug: string): Promise<Article[]> {
  const cached = getCachedFeed(slug);
  if (cached && Date.now() - cached.time < TTL) {
    console.log("Dùng cache:", slug);
    return cached.items;
  }
  if (cached) {
    console.log("Cache hết hạn, đang cập nhật nền:", slug);

    void refreshFeed(slug).catch(error => {
      console.warn("RSS lỗi, tiếp tục giữ cache cũ:", slug, error);
    });

    return cached.items;
  }
  try {
    return await refreshFeed(slug);
  } catch (error) {
    console.error("Không tải được RSS:", slug, error);
    return getFallbackArticles(slug);
  }
}


// Thời điểm đăng dạng số, ngày không hợp lệ tính là 0 để bài đó xuống cuối danh sách
function publishedTime(a: Article): number {
  const t = new Date(a.pubDate).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Gộp tin từ nhiều chuyên mục: bỏ bài mẫu khi RSS lỗi, bỏ bài trùng giữa các chuyên mục
 * (giữ bản xuất hiện đầu tiên) và sắp xếp bài mới nhất lên đầu
 */
export function combineFeeds(lists: Article[][]): Article[] {
  const seen = new Set<string>();
  return lists
      .flat()
      .filter((a) => !a.id.startsWith('fallback-'))
      .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
      .sort((a, b) => publishedTime(b) - publishedTime(a));
}

export async function getAllFeeds(): Promise<Article[]> {
  const results = await Promise.allSettled(
      CATEGORIES.filter((c) => c.slug !== 'trang-chu').map((c) => getFeed(c.slug))
  );
  return combineFeeds(results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])));
}

// Chuẩn hóa văn bản để so khớp: bỏ dấu, chữ thường, ký tự không phải chữ/số thành khoảng trắng
export function normalizeForMatch(s: string): string {
  return ' ' + removeAccents(s).replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
}

// Một bài khớp từ khóa, kèm danh sách từ khóa đã khớp
export interface KeywordMatch {
  article: Article;
  matched: string[];
}

/**
 * Lọc bài theo từ khóa trong tiêu đề và mô tả: không phân biệt hoa thường và dấu, khớp theo nguyên từ.
 * Bài khớp ít nhất một từ khóa là, Kết quả sắp xếp mới nhất lên đầu
 */
export function filterByKeywords(articles: Article[], keywords: string[]): KeywordMatch[] {
  const wanted = keywords
      .map((keyword) => ({ keyword, key: normalizeForMatch(keyword) }))
      .filter((k) => k.key.trim() !== '');
  if (wanted.length === 0) return [];

  const result: KeywordMatch[] = [];
  for (const article of articles) {
    // Chuẩn hóa riêng tiêu đề và mô tả
    const text = normalizeForMatch(article.title) + '|' + normalizeForMatch(article.summary);
    const matched = wanted.filter((k) => text.includes(k.key)).map((k) => k.keyword);
    if (matched.length > 0) result.push({ article, matched });
  }
  return result.sort((a, b) => publishedTime(b.article) - publishedTime(a.article));
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
