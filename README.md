# Dân trí (bản đồ án Frontend)

Bản sao rút gọn trang tin tức Dân trí, viết bằng **React + TypeScript + Vite**.

## Chạy dự án
```bash
npm install
npm run dev          # chạy thử, mở http://localhost:5173
npm run typecheck    # kiểm tra kiểu TypeScript
npm run build        # kiểm tra kiểu rồi build bản production
```
Web Crypto cho đăng nhập cần `localhost` hoặc https.

## Cấu trúc
- `src/types/index.ts`: toàn bộ kiểu dùng chung (Article, BookmarkItem, User, AsyncState...)
- `src/services/rss.ts`: lấy và chuẩn hóa RSS (proxy CORS + rss2json dự phòng), cache 5 phút
- `src/services/weather.ts`: API Open-Meteo
- `src/services/auth.ts`, `context/AuthContext.tsx`: đăng nhập phía client
- `src/services/storage.ts`: đọc/ghi localStorage theo từng người dùng (có kiểu generic)
- `src/hooks/useBookmarks.ts`, `pages/SavedPage.tsx`: chức năng mới 1
- `src/hooks/useFollows.ts`, `pages/MyFeedPage.tsx`: chức năng mới 2
- `src/config/categories.ts`: danh sách chuyên mục và URL RSS (kiểm tra tại https://dantri.com.vn/rss.htm)

Phân công chi tiết: `docs/PHAN-CONG.md`.

## Quy ước TypeScript của nhóm
- Bật `strict`; không dùng `any`, nếu cần kiểu chưa rõ thì dùng `unknown` rồi thu hẹp.
- Kiểu dùng chung đặt trong `src/types/index.ts`; kiểu chỉ dùng trong một file thì khai báo ngay trong file đó.
- Import không ghi đuôi file (`./components/Header`, không phải `Header.tsx`).
- Hàm gọi localStorage luôn dùng generic: `readUser<string[]>(userId, 'keywords', [])`.
- Trước khi push phải chạy `npm run typecheck` không có lỗi.

## Lưu ý
- RSS chỉ có tiêu đề, tóm tắt và ảnh, không có toàn văn, nên trang chi tiết kèm link sang bài gốc.
- Proxy công cộng (allorigins, rss2json) có giới hạn tốc độ; nếu bị chặn khi demo, cân nhắc dùng Vite dev proxy hoặc Cloudflare Worker.
