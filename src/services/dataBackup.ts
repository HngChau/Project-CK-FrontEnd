// Xuất/nhập dữ liệu người dùng bằng file JSON.
// Đọc và ghi thẳng localStorage theo khóa dt:<userId>:<tên> nên không phụ thuộc các hook.
import { CATEGORIES } from '../config/categories';
import { COLLECTION_NAME_MAX, NOTE_MAX } from '../hooks/useCollections';
import type { Collection } from '../hooks/useCollections';
import { parseKeywords } from './follows';
import { readUser, userKey, writeUser } from './storage';

export const BACKUP_APP = 'dantri-fe';
export const BACKUP_VERSION = 1;
export const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_BOOKMARKS = 1000;

// Tên khóa (phần sau dt:<userId>:)
const KEYS = {
    bookmarks: 'bookmarks',
    collections: 'collections',
    assignments: 'assignments',
    notes: 'notes',
    keywords: 'keywords',
    followedCategories: 'followedCategories',
    followedAuthors: 'followedAuthors',
} as const;

export type BackupSection = keyof typeof KEYS;

export interface BackupData {
    bookmarks: Record<string, unknown>[];
    collections: Collection[];
    assignments: Record<string, string>;
    notes: Record<string, string>;
    keywords: string[];
    followedCategories: string[];
    followedAuthors: string[];
}

export interface BackupFile extends BackupData {
    app: string;
    version: number;
    exportedAt: string;
}

// Lỗi có thông báo tiếng Việt, hiển thị thẳng cho người dùng
export class BackupError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BackupError';
    }
}

export interface ParsedBackup {
    data: Partial<BackupData>;
    counts: Partial<Record<BackupSection, number>>;
    skipped: number;
}

// Xuất json
export function buildBackup(userId: string): BackupFile {
    return {
        app: BACKUP_APP,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        bookmarks: readUser<Record<string, unknown>[]>(userId, KEYS.bookmarks, []),
        collections: readUser<Collection[]>(userId, KEYS.collections, []),
        assignments: readUser<Record<string, string>>(userId, KEYS.assignments, {}),
        notes: readUser<Record<string, string>>(userId, KEYS.notes, {}),
        keywords: readUser<string[]>(userId, KEYS.keywords, []),
        followedCategories: readUser<string[]>(userId, KEYS.followedCategories, []),
        followedAuthors: readUser<string[]>(userId, KEYS.followedAuthors, []),
    };
}

export function downloadBackup(file: BackupFile): void {
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `du-lieu-dan-tri-${file.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Nhập: kiểm tra toàn bộ file trước, đúng hết mới ghi
const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

function checkBookmarks(v: unknown): Record<string, unknown>[] {
    if (!Array.isArray(v)) throw new BackupError('Mục "bookmarks" phải là một danh sách');
    if (v.length > MAX_BOOKMARKS) throw new BackupError(`Chỉ nhập tối đa ${MAX_BOOKMARKS} bài đã lưu`);
    const seen = new Set<string>();
    const result: Record<string, unknown>[] = [];
    v.forEach((item, i) => {
        if (!isObj(item) || !isStr(item.id) || !item.id || !isStr(item.title) || !isStr(item.link)) {
            throw new BackupError(`Bài đã lưu thứ ${i + 1} thiếu id, tiêu đề hoặc liên kết`);
        }
        if (seen.has(item.id)) return;
        seen.add(item.id);
        result.push(item);
    });
    return result;
}

function checkCollections(v: unknown): Collection[] {
    if (!Array.isArray(v)) throw new BackupError('Mục "collections" phải là một danh sách');
    const ids = new Set<string>();
    const names = new Set<string>();
    return v.map((item, i) => {
        if (!isObj(item) || !isStr(item.id) || !item.id) {
            throw new BackupError(`Bộ sưu tập thứ ${i + 1} thiếu id`);
        }
        const name = isStr(item.name) ? item.name.trim() : '';
        if (!name) throw new BackupError(`Bộ sưu tập thứ ${i + 1} không có tên`);
        if (name.length > COLLECTION_NAME_MAX) {
            throw new BackupError(`Tên bộ sưu tập "${name.slice(0, 20)}..." dài quá ${COLLECTION_NAME_MAX} ký tự`);
        }
        if (typeof item.createdAt !== 'number' || !Number.isFinite(item.createdAt)) {
            throw new BackupError(`Bộ sưu tập "${name}" có ngày tạo không hợp lệ`);
        }
        if (ids.has(item.id)) throw new BackupError(`Có hai bộ sưu tập trùng id: ${item.id}`);
        const nameKey = name.toLowerCase();
        if (names.has(nameKey)) throw new BackupError(`Có hai bộ sưu tập trùng tên: ${name}`);
        ids.add(item.id);
        names.add(nameKey);
        return { id: item.id, name, createdAt: item.createdAt };
    });
}

function checkAssignments(v: unknown, validCollectionIds: Set<string>) {
    if (!isObj(v)) throw new BackupError('Mục "assignments" phải là một đối tượng');
    const entries = Object.entries(v);
    for (const [articleId, collectionId] of entries) {
        if (!isStr(collectionId)) {
            throw new BackupError(`Bài ${articleId} có bộ sưu tập không hợp lệ`);
        }
    }
    // Bài xếp vào bộ sưu tập không tồn tại thì bỏ qua (về "Chưa phân loại")
    const kept = entries.filter(([, cid]) => validCollectionIds.has(cid as string));
    return { value: Object.fromEntries(kept) as Record<string, string>, skipped: entries.length - kept.length };
}

function checkNotes(v: unknown): Record<string, string> {
    if (!isObj(v)) throw new BackupError('Mục "notes" phải là một đối tượng');
    const kept: [string, string][] = [];
    for (const [articleId, text] of Object.entries(v)) {
        if (!isStr(text)) throw new BackupError(`Ghi chú của bài ${articleId} không phải chuỗi chữ`);
        if (text.length > NOTE_MAX) {
            throw new BackupError(`Ghi chú của bài ${articleId} dài quá ${NOTE_MAX} ký tự`);
        }
        if (text.trim()) kept.push([articleId, text]);
    }
    return Object.fromEntries(kept);
}

function checkStringList(name: string, v: unknown): string[] {
    if (!Array.isArray(v) || v.some((x) => !isStr(x))) {
        throw new BackupError(`Mục "${name}" phải là một danh sách chữ`);
    }
    return Array.from(new Set(v as string[]));
}

// Đọc và kiểm tra nội dung file. Ném BackupError nếu file sai; chưa ghi gì vào localStorage
export function parseBackup(text: string, userId: string): ParsedBackup {
    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch {
        throw new BackupError('File không phải JSON hợp lệ');
    }
    if (!isObj(raw)) throw new BackupError('Nội dung file không đúng định dạng dữ liệu của ứng dụng');
    if (raw.app !== BACKUP_APP) throw new BackupError('Đây không phải file dữ liệu do ứng dụng này xuất ra');
    if (raw.version !== BACKUP_VERSION) {
        throw new BackupError('Phiên bản của file dữ liệu không được hỗ trợ');
    }

    const data: Partial<BackupData> = {};
    const counts: ParsedBackup['counts'] = {};
    let skipped = 0;

    if ('bookmarks' in raw) data.bookmarks = checkBookmarks(raw.bookmarks);
    if ('collections' in raw) data.collections = checkCollections(raw.collections);
    if ('assignments' in raw) {
        // Không có mục collections trong file thì đối chiếu với bộ sưu tập đang có
        const collections = data.collections ?? readUser<Collection[]>(userId, KEYS.collections, []);
        const result = checkAssignments(raw.assignments, new Set(collections.map((c) => c.id)));
        data.assignments = result.value;
        skipped += result.skipped;
    }
    if ('notes' in raw) data.notes = checkNotes(raw.notes);
    if ('keywords' in raw) {
        if (!Array.isArray(raw.keywords)) throw new BackupError('Mục "keywords" phải là một danh sách');
        data.keywords = parseKeywords(raw.keywords);
    }
    if ('followedCategories' in raw) {
        const slugs = new Set(CATEGORIES.map((c) => c.slug));
        const list = checkStringList('followedCategories', raw.followedCategories);
        data.followedCategories = list.filter((s) => slugs.has(s));
        skipped += list.length - data.followedCategories.length;
    }
    if ('followedAuthors' in raw) data.followedAuthors = checkStringList('followedAuthors', raw.followedAuthors);

    const sections = Object.keys(data) as BackupSection[];
    if (sections.length === 0) throw new BackupError('File không có dữ liệu nào để khôi phục');
    for (const s of sections) {
        const value = data[s] as unknown;
        counts[s] = Array.isArray(value) ? value.length : Object.keys(value as object).length;
    }
    return { data, counts, skipped };
}

// Ghi dữ liệu đã kiểm tra vào localStorage. Lỗi giữa chừng thì trả về dữ liệu cũ
export function applyBackup(userId: string, data: Partial<BackupData>): void {
    const sections = Object.keys(data) as BackupSection[];
    const previous = sections.map((s) => [s, localStorage.getItem(userKey(userId, KEYS[s]))] as const);
    try {
        for (const s of sections) writeUser(userId, KEYS[s], data[s]);
    } catch {
        for (const [s, old] of previous) {
            try {
                if (old === null) localStorage.removeItem(userKey(userId, KEYS[s]));
                else localStorage.setItem(userKey(userId, KEYS[s]), old);
            } catch {
            // bỏ qua
            }
        }
        throw new BackupError('Không ghi được dữ liệu (bộ nhớ trình duyệt có thể đã đầy). Dữ liệu cũ được giữ nguyên.');
    }
}