//quản lý từ khóa theo dõi.
// Dữ liệu lưu theo từng tài khoản (khóa dt:<userId>:keywords) nên vẫn còn sau khi tải lại trang
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { readUser, writeUser } from '../services/storage';
import { checkKeyword, cleanKeyword, keywordKey, parseKeywords } from '../services/follows';
import type { AddResult } from '../services/follows';

const STORAGE_NAME = 'keywords';
// Phát ra khi danh sách đổi, để mọi nơi đang dùng hook này (trang Bản tin, menu...) cập nhật cùng lúc
const CHANGE_EVENT = 'dt:follows-changed';

function readKeywords(userId: string | undefined): string[] {
  return userId ? parseKeywords(readUser<unknown>(userId, STORAGE_NAME, [])) : [];
}

function commit(userId: string, list: string[]): boolean {
  try {
    writeUser<string[]>(userId, STORAGE_NAME, list);
  } catch {
    return false; // trình duyệt chặn hoặc hết dung lượng localStorage
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

interface UseFollows {
  keywords: string[];   /** Danh sách từ khóa đang theo dõi, theo thứ tự đã thêm */
  add: (keyword: string) => AddResult;   /** Thêm từ khóa. Trả về kết quả kèm thông báo lỗi nếu không thêm được */
  remove: (keyword: string) => void;   /** Xóa một từ khóa (so khớp không phân biệt hoa thường và dấu) */
  validate: (keyword: string) => string;   /** Kiểm tra từ khóa đang gõ, trả về thông báo lỗi hoặc chuỗi rỗng nếu hợp lệ */
}

export function useFollows(): UseFollows {
  const { user } = useAuth();
  const userId = user?.id;
  const [keywords, setKeywords] = useState<string[]>(() => readKeywords(userId));

  // Nạp lại khi đổi tài khoản, và đồng bộ khi danh sách đổi ở nơi khác hoặc tab khác.
  useEffect(() => {
    const sync = () => setKeywords(readKeywords(userId));
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [userId]);

  const add = useCallback(
      (raw: string): AddResult => {
        if (!userId) return { ok: false, error: 'Vui lòng đăng nhập để theo dõi từ khóa' };
        // Đọc lại từ localStorage để không ghi đè thay đổi từ nơi khác.
        const current = readKeywords(userId);
        const error = checkKeyword(raw, current);
        if (error) return { ok: false, error };
        const keyword = cleanKeyword(raw);
        if (!commit(userId, [...current, keyword])) {
          return { ok: false, error: 'Không lưu được từ khóa, vui lòng thử lại' };
        }
        return { ok: true, keyword };
      },
      [userId]
  );

  const remove = useCallback(
      (keyword: string): void => {
        if (!userId) return;
        const key = keywordKey(keyword);
        commit(userId, readKeywords(userId).filter((k) => keywordKey(k) !== key));
      },
      [userId]
  );

  const validate = useCallback((raw: string): string => checkKeyword(raw, keywords), [keywords]);

  return { keywords, add, remove, validate };
}