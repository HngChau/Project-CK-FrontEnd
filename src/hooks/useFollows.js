// CHỨC NĂNG MỚI 2 (TV3): Theo dõi từ khóa + "Bản tin của tôi".
// Khung đã có: thêm/xóa từ khóa. TODO cho TV3: badge tin chưa đọc, đánh dấu đã đọc, tự làm mới, thống kê.
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';

export function useFollows() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    setKeywords(user ? readUser(user.id, 'keywords', []) : []);
  }, [user]);

  const save = (next) => {
    setKeywords(next);
    if (user) writeUser(user.id, 'keywords', next);
  };

  const add = (kw) => {
    const k = kw.trim();
    if (k && !keywords.some((x) => x.toLowerCase() === k.toLowerCase())) save([...keywords, k]);
  };
  const remove = (kw) => save(keywords.filter((x) => x !== kw));

  return { keywords, add, remove };
}
