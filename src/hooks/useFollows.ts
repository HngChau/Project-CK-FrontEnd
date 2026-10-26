// CHỨC NĂNG MỚI 2 (TV3): Theo dõi từ khóa + "Bản tin của tôi".
// Khung đã có: thêm/xóa từ khóa. TODO cho TV3: badge tin chưa đọc, đánh dấu đã đọc, tự làm mới, thống kê.
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';

interface UseFollows {
  keywords: string[];
  add: (kw: string) => void;
  remove: (kw: string) => void;
}

export function useFollows(): UseFollows {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    setKeywords(user ? readUser<string[]>(user.id, 'keywords', []) : []);
  }, [user]);

  const save = (next: string[]): void => {
    setKeywords(next);
    if (user) writeUser<string[]>(user.id, 'keywords', next);
  };

  const add = (kw: string): void => {
    const k = kw.trim();
    if (k && !keywords.some((x) => x.toLowerCase() === k.toLowerCase())) save([...keywords, k]);
  };
  const remove = (kw: string): void => save(keywords.filter((x) => x !== kw));

  return { keywords, add, remove };
}
