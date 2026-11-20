// Xuất dữ liệu người dùng ra file JSON
// Đọc thẳng localStorage theo khóa dt:<userId>:<tên> nên không phụ thuộc các hook
import type { Collection } from '../hooks/useCollections';
import { readUser } from './storage';

export const BACKUP_APP = 'dantri-fe';
export const BACKUP_VERSION = 1;

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