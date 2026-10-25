# Dân trí (bản đồ án Frontend)

Bản sao rút gọn trang tin tức Dân trí, viết bằng React + Vite.

## Chạy dự án
```bash
npm install
npm run dev
```
Mở http://localhost:5173 (Web Crypto cho đăng nhập cần `localhost` hoặc https).

## Cấu trúc
- `src/services/rss.js`: lấy và chuẩn hóa RSS (proxy CORS + rss2json dự phòng), cache 5 phút
- `src/services/weather.js`: API Open-Meteo
- `src/services/auth.js`, `context/AuthContext.jsx`: đăng nhập phía client
- `src/hooks/useBookmarks.js`, `pages/SavedPage.jsx`: chức năng mới 1
- `src/hooks/useFollows.js`, `pages/MyFeedPage.jsx`: chức năng mới 2
- `src/config/categories.js`: danh sách chuyên mục và URL RSS (kiểm tra tại https://dantri.com.vn/rss.htm)

Phân công chi tiết: `docs/PHAN-CONG.md`.

## Lưu ý
- RSS chỉ có tiêu đề, tóm tắt và ảnh, không có toàn văn, nên trang chi tiết kèm link sang bài gốc.
- Proxy công cộng (allorigins, rss2json) có giới hạn tốc độ; nếu bị chặn khi demo, cân nhắc dùng Vite dev proxy hoặc Cloudflare Worker.
