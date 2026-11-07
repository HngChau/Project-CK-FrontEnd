import type { Article } from '../types';

export interface ViewedItem {
    id: string;
    title: string;
    to: string;
    image?: string;
    category?: string;
    article?: Article;
    viewedAt: number;
}

const MAX_ITEMS = 50;
const keyOf = (email: string) => `viewed-articles:${email}`;

export function getViewed(email: string): ViewedItem[] {
    try {
        const raw = localStorage.getItem(keyOf(email));
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function write(email: string, list: ViewedItem[]) {
    try {
        localStorage.setItem(keyOf(email), JSON.stringify(list));
    } catch {
        /* bỏ qua nếu trình duyệt chặn localStorage */
    }
}

// Ghi nhận 1 lượt xem: bài xem lại sẽ nhảy lên đầu, giữ tối đa MAX_ITEMS bài
export function recordView(email: string, item: Omit<ViewedItem, 'viewedAt'>) {
    const rest = getViewed(email).filter((i) => i.id !== item.id);
    write(email, [{ ...item, viewedAt: Date.now() }, ...rest].slice(0, MAX_ITEMS));
}

export function removeViewed(email: string, id: string): ViewedItem[] {
    const next = getViewed(email).filter((i) => i.id !== id);
    write(email, next);
    return next;
}

export function clearViewed(email: string) {
    write(email, []);
}