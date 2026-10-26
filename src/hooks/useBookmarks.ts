// CHỨC NĂNG MỚI 1 (TV2): Đọc sau + bộ sưu tập + ghi chú.
// Khung đã có: lưu/bỏ lưu bài. TODO cho TV2: collections, ghi chú, sắp xếp, xuất/nhập JSON.
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';
import type { Article, BookmarkItem } from '../types';

interface UseBookmarks {
  items: BookmarkItem[];
  isSaved: (id: string) => boolean;
  toggle: (article: Article) => void;
}

export function useBookmarks(): UseBookmarks {
  const { user } = useAuth();
  const [items, setItems] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    setItems(user ? readUser<BookmarkItem[]>(user.id, 'bookmarks', []) : []);
  }, [user]);

  const persist = useCallback(
    (next: BookmarkItem[]) => {
      setItems(next);
      if (user) writeUser<BookmarkItem[]>(user.id, 'bookmarks', next);
    },
    [user]
  );

  const isSaved = (id: string): boolean => items.some((b) => b.id === id);

  // Đọc lại từ localStorage mỗi lần bấm để nhiều nút trên cùng trang không ghi đè nhau.
  // TODO (TV2): chuyển sang BookmarkContext dùng chung để các nút tự cập nhật đồng bộ.
  const toggle = (article: Article): void => {
    const current = user ? readUser<BookmarkItem[]>(user.id, 'bookmarks', []) : [];
    if (current.some((b) => b.id === article.id)) {
      persist(current.filter((b) => b.id !== article.id));
    } else {
      persist([{ ...article, content: '', savedAt: Date.now(), collection: null, note: '' }, ...current]);
    }
  };

  return { items, isSaved, toggle };
}
