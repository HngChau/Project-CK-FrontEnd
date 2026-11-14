import type { KeywordMatch } from './rss';

export interface KeywordGroup {
    keyword: string;
    items: KeywordMatch[];
}

export function groupByKeyword(matches: KeywordMatch[], keywords: string[]): KeywordGroup[] {
    const groups = new Map<string, KeywordMatch[]>();
    const seen = new Set<string>();

    for (const m of matches) {
        if (seen.has(m.article.id)) continue; // bỏ bài trùng
        const keyword = keywords.find((k) => m.matched.includes(k));
        if (!keyword) continue;
        seen.add(m.article.id);
        const list = groups.get(keyword);
        if (list) list.push(m);
        else groups.set(keyword, [m]);
    }

    return keywords
        .filter((k) => groups.has(k))
        .map((k) => ({ keyword: k, items: groups.get(k) ?? [] }));
}