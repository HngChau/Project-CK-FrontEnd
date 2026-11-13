import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';

export interface Collection {
    id: string;
    name: string;
    createdAt: number;
}

export const COLLECTION_NAME_MAX = 40;
export const NOTE_MAX = 500;

interface Data {
    collections: Collection[];
    // id bài -> id bộ sưu tập
    assignments: Record<string, string>;
    // id bài -> nội dung ghi chú
    notes: Record<string, string>;
}

const EMPTY: Data = { collections: [], assignments: {}, notes: {} };

function readAll(uid: string): Data {
    if (!uid) return EMPTY;
    return {
        collections: readUser<Collection[]>(uid, 'collections', []),
        assignments: readUser<Record<string, string>>(uid, 'assignments', {}),
        notes: readUser<Record<string, string>>(uid, 'notes', {}),
    };
}

/** Trả về thông báo lỗi */
export function validateCollectionName(name: string, existing: Collection[], ignoreId?: string): string {
    const value = name.trim();
    if (!value) return 'Vui lòng nhập tên bộ sưu tập';
    if (value.length > COLLECTION_NAME_MAX) return `Tên tối đa ${COLLECTION_NAME_MAX} ký tự`;
    const duplicated = existing.some(
        (c) => c.id !== ignoreId && c.name.toLowerCase() === value.toLowerCase()
    );
    if (duplicated) return 'Tên bộ sưu tập đã tồn tại';
    return '';
}

export function useCollections() {
    const { user } = useAuth();
    const uid = user?.id ?? '';
    const [data, setData] = useState<Data>(() => readAll(uid));
    const ref = useRef<Data>(data);

    // Đổi tài khoản thì đọc lại dữ liệu của tài khoản đó
    useEffect(() => {
        const fresh = readAll(uid);
        ref.current = fresh;
        setData(fresh);
    }, [uid]);

    const update = (patch: Partial<Data>) => {
        const next: Data = { ...ref.current, ...patch };
        ref.current = next;
        setData(next);
        if (!uid) return;
        try {
            (Object.keys(patch) as (keyof Data)[]).forEach((k) => writeUser(uid, k, next[k]));
        } catch {
            // bộ nhớ trình duyệt đầy: dữ liệu vẫn giữ trong phiên hiện tại
        }
    };

    // Tạo/đổi tên trả về thông báo lỗi ('' = thành công)
    const createCollection = (name: string): string => {
        const error = validateCollectionName(name, ref.current.collections);
        if (error) return error;
        const item: Collection = { id: crypto.randomUUID(), name: name.trim(), createdAt: Date.now() };
        update({ collections: [...ref.current.collections, item] });
        return '';
    };

    const renameCollection = (id: string, name: string): string => {
        const error = validateCollectionName(name, ref.current.collections, id);
        if (error) return error;
        update({
            collections: ref.current.collections.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
        });
        return '';
    };

    const deleteCollection = (id: string) => {
        // Bài trong bộ sưu tập bị xóa quay về "Chưa phân loại", không bị xóa theo
        const assignments = Object.fromEntries(
            Object.entries(ref.current.assignments).filter(([, cid]) => cid !== id)
        );
        update({ collections: ref.current.collections.filter((c) => c.id !== id), assignments });
    };

    // collectionId = null nghĩa là đưa về "Chưa phân loại"
    const moveArticle = (articleId: string, collectionId: string | null) => {
        const next = { ...ref.current.assignments };
        if (collectionId) next[articleId] = collectionId;
        else delete next[articleId];
        update({ assignments: next });
    };

    // Ghi chú rỗng thì xóa luôn khỏi dữ liệu
    const setNote = (articleId: string, text: string) => {
        const value = text.slice(0, NOTE_MAX);
        const next = { ...ref.current.notes };
        if (value.trim()) next[articleId] = value;
        else delete next[articleId];
        update({ notes: next });
    };

    return {
        collections: data.collections,
        assignments: data.assignments,
        notes: data.notes,
        createCollection,
        renameCollection,
        deleteCollection,
        moveArticle,
        setNote,
    };
}