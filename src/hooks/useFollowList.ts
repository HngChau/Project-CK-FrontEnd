// Danh sách id đã theo dõi (chuyên mục, tác giả), lưu theo từng tài khoản.
// Khóa: dt:<userId>:followedCategories và dt:<userId>:followedAuthors
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';

export type FollowKind = 'categories' | 'authors';

const STORAGE_NAME: Record<FollowKind, string> = {
    categories: 'followedCategories',
    authors: 'followedAuthors',
};

const CHANGE_EVENT = 'dt:follow-list-changed';

function readIds(userId: string | undefined, kind: FollowKind): string[] {
    if (!userId) return [];
    const raw = readUser<unknown>(userId, STORAGE_NAME[kind], []);
    if (!Array.isArray(raw)) return [];
    return Array.from(new Set(raw.filter((x): x is string => typeof x === 'string')));
}

// Trả về tập id đang theo dõi, hàm bật/tắt theo dõi một id
export function useFollowList(kind: FollowKind) {
    const { user } = useAuth();
    const userId = user?.id;
    const [ids, setIds] = useState<string[]>(() => readIds(userId, kind));

    // Nạp lại khi đổi tài khoản, và đồng bộ khi danh sách đổi ở nơi khác hoặc tab khác
    useEffect(() => {
        const sync = () => setIds(readIds(userId, kind));
        const onChange = (e: Event) => {
            if ((e as CustomEvent<FollowKind>).detail === kind) sync();
        };
        sync();
        window.addEventListener(CHANGE_EVENT, onChange);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(CHANGE_EVENT, onChange);
            window.removeEventListener('storage', sync);
        };
    }, [userId, kind]);

    const toggle = useCallback(
        (id: string) => {
            if (!userId) return;
            // Đọc lại từ localStorage để không ghi đè thay đổi từ nơi khác
            const current = readIds(userId, kind);
            const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
            try {
                writeUser<string[]>(userId, STORAGE_NAME[kind], next);
            } catch {
                return;
            }
            window.dispatchEvent(new CustomEvent<FollowKind>(CHANGE_EVENT, { detail: kind }));
        },
        [userId, kind]
    );

    const followed = useMemo(() => new Set(ids), [ids]);
    return [followed, toggle] as const;
}