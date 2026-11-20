// Tin theo chuyên mục đã theo dõi, dùng chung kiểu KeywordMatch với tin theo từ khóa
import type { KeywordMatch } from './rss';
import type { Article, Category } from '../types';

export const categoryLabel = (name: string): string => `Chuyên mục: ${name}`;

function publishedTime(a: Article): number {
    const t = new Date(a.pubDate).getTime();
    return Number.isNaN(t) ? 0 : t;
}

// Lấy các bài thuộc những chuyên mục đã theo dõi.
export function filterByCategories(
    articles: Article[],
    categories: Pick<Category, 'slug' | 'name'>[]
): KeywordMatch[] {
    if (categories.length === 0) return [];
    const labelBySlug = new Map(categories.map((c) => [c.slug, categoryLabel(c.name)]));
    const result: KeywordMatch[] = [];
    for (const article of articles) {
        const label = labelBySlug.get(article.category);
        if (label) result.push({ article, matched: [label] });
    }
    return result;
}

// Gộp nhiều danh sách bài khớp: một bài chỉ xuất hiện một lần (gộp các nhãn đã khớp), mới nhất lên đầu.
export function mergeMatches(...lists: KeywordMatch[][]): KeywordMatch[] {
    const byId = new Map<string, KeywordMatch>();
    for (const list of lists) {
        for (const m of list) {
            const existing = byId.get(m.article.id);
            if (existing) {
                existing.matched = [...existing.matched, ...m.matched.filter((x) => !existing.matched.includes(x))];
            } else {
                byId.set(m.article.id, { article: m.article, matched: [...m.matched] });
            }
        }
    }
    return Array.from(byId.values()).sort((a, b) => publishedTime(b.article) - publishedTime(a.article));
}