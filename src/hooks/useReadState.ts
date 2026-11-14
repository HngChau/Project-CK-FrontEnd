import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';
import { addReadId, parseReadIds, sameList } from '../services/readState';

const STORAGE_NAME = 'readIds';
const CHANGE_EVENT = 'dt:read-changed';

function readStored(userId: string | undefined): string[] {
    return userId ? parseReadIds(readUser<unknown>(userId, STORAGE_NAME, [])) : [];
}

interface UseReadState {
    readIds: ReadonlySet<string>;
    isRead: (id: string) => boolean;
    markRead: (id: string) => void;
}

export function useReadState(): UseReadState {
    const { user } = useAuth();
    const userId = user?.id;
    const [ids, setIds] = useState<string[]>(() => readStored(userId));

    useEffect(() => {
        const sync = () => setIds((prev) => {
            const next = readStored(userId);
            return sameList(prev, next) ? prev : next;
        });
        sync();
        window.addEventListener(CHANGE_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(CHANGE_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, [userId]);

    const readIds = useMemo<ReadonlySet<string>>(() => new Set(ids), [ids]);
    const isRead = useCallback((id: string): boolean => readIds.has(id), [readIds]);

    const markRead = useCallback(
        (id: string): void => {
            if (!userId || !id) return;
            const current = readStored(userId);
            const next = addReadId(current, id);
            if (next === current) return; // đã đọc rồi, không ghi và không phát sự kiện
            try {
                writeUser<string[]>(userId, STORAGE_NAME, next);
            } catch {
                return;
            }
            window.dispatchEvent(new Event(CHANGE_EVENT));
        },
        [userId]);

    return { readIds, isRead, markRead };
}