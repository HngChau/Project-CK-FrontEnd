import { sameList } from './readState';
import type { Article } from '../types';

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function shouldApplyRefresh(prev: Article[] | null, next: Article[]): boolean {
    if (next.length === 0) return false;
    if (!prev) return true;
    return !sameList(
        prev.map((a) => a.id),
        next.map((a) => a.id));
}