export const MAX_READ_IDS = 1000;

export function parseReadIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of raw) {
        if (typeof item !== 'string' || !item || seen.has(item)) continue;
        seen.add(item);
        result.push(item);
    }
    return result.slice(-MAX_READ_IDS);
}

export function addReadId(list: string[], id: string): string[] {
    if (!id || list.includes(id)) return list;
    return [...list, id].slice(-MAX_READ_IDS);
}

export function sameList(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((x, i) => x === b[i]);
}

export function formatBadge(count: number, max = 99): string {
    if (!Number.isFinite(count) || count <= 0) return '';
    return count > max ? `${max}+` : String(Math.floor(count));
}