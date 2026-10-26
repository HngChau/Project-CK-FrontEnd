# Bảng phân công đồ án (4 tuần, 3 thành viên)

## Hai chức năng mới (trang Dân trí gốc chưa có)
1. **Đọc sau + bộ sưu tập + ghi chú** (cần đăng nhập): lưu bài, gom vào bộ sưu tập, ghi chú riêng cho từng bài.
2. **Theo dõi từ khóa + "Bản tin của tôi"** (cần đăng nhập): theo dõi từ khóa, hệ thống lọc tin khớp từ tất cả chuyên mục RSS, báo số tin mới chưa đọc.

> Trước khi chốt, cả nhóm tự kiểm tra lại trên dantri.com.vn (web và app) xem hai chức năng này đã có chưa.

## Yêu cầu kỹ thuật và nơi đáp ứng
| Yêu cầu | Cách làm | Người phụ trách |
|---|---|---|
| Dùng RSS | `services/rss.ts` lấy RSS các chuyên mục qua proxy CORS | TV1 |
| Dùng API | rss2json (dự phòng RSS) + Open-Meteo (thời tiết) | TV1 |
| Tự xử lý login, không viết server | `services/auth.ts`: localStorage + băm mật khẩu SHA-256 | TV2 |

## Phân vai (độ khó cân bằng: mỗi người 1 mảng nền + 1 mảng logic riêng)
| | TV1: Nền tảng tin tức | TV2: Tài khoản + Chức năng 1 | TV3: Bài viết + Chức năng 2 |
|---|---|---|---|
| Mảng nền | Layout, router, RSS service, trang chủ, chuyên mục, tìm kiếm, widget thời tiết | Đăng ký, đăng nhập, route bảo vệ, quản lý phiên | Trang chi tiết bài, bài liên quan, cỡ chữ và chế độ tối, triển khai |
| Chức năng mới | (hỗ trợ cả hai, xem tuần 4) | Đọc sau, bộ sưu tập, ghi chú | Theo dõi từ khóa, bản tin cá nhân, badge tin chưa đọc |
| Độ khó chính | Xử lý dữ liệu RSS không đồng nhất, cache, tìm kiếm bỏ dấu | Bảo mật phía client, mô hình dữ liệu bộ sưu tập | Lọc/dedupe nhiều feed, theo dõi trạng thái đã đọc |

## Lịch theo tuần
| Tuần | TV1 | TV2 | TV3 |
|---|---|---|---|
| 1 | Cài đặt dự án, layout, header/menu, `rss.ts` chạy được với tất cả chuyên mục | `auth.ts`, AuthContext, trang đăng ký/đăng nhập, ProtectedRoute | Trang chi tiết bài (lấy dữ liệu theo id), thiết kế dữ liệu `storage.ts` và `useFollows` |
| 2 | Trang chủ (bài nổi bật + lưới theo chuyên mục), trang chuyên mục + phân trang phía client | Đọc sau: nút lưu, trang Đã lưu, đồng bộ trạng thái bằng BookmarkContext | Theo dõi từ khóa: thêm/xóa, lọc tin khớp từ mọi chuyên mục (bỏ dấu, bỏ trùng) |
| 3 | Tìm kiếm (lọc theo chuyên mục, sắp xếp), widget thời tiết nhiều thành phố, xử lý lỗi/loading | Bộ sưu tập (tạo, đổi tên, xóa, chuyển bài), ghi chú theo bài, xuất/nhập JSON | Đánh dấu đã đọc, badge tin mới trên menu, tự làm mới mỗi 5 phút, nhóm tin theo từ khóa |
| 4 | Responsive, tối ưu tải ảnh, kiểm thử chéo trình duyệt, viết báo cáo phần nền | Kiểm thử luồng đăng nhập/lưu bài, sửa lỗi, báo cáo phần tài khoản + chức năng 1 | Chế độ tối, bài liên quan, triển khai (Netlify/Vercel/GitHub Pages), báo cáo + demo chức năng 2 |

## Quy ước làm việc nhóm
- Mỗi người một nhánh git (`feat/tv1-...`, `feat/tv2-...`, `feat/tv3-...`), gộp vào `main` bằng pull request, người còn lại review.
- Dữ liệu người dùng luôn lưu qua `readUser/writeUser` (khóa `dt:<userId>:<tên>`) để TV2 và TV3 không ghi đè nhau.
- Họp 15 phút đầu mỗi tuần để chốt giao diện giữa các module; cuối tuần 2 tích hợp thử toàn bộ.
