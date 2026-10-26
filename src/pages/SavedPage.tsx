import { useBookmarks } from '../hooks/useBookmarks';
import ArticleCard from '../components/ArticleCard';

// CHỨC NĂNG MỚI 1 (TV2)
export default function SavedPage() {
  const { items } = useBookmarks();
  return (
    <>
      <h1>Bài đã lưu</h1>
      {/* TODO (TV2): bộ sưu tập (tạo/đổi tên/xóa), chuyển bài giữa bộ sưu tập, ghi chú từng bài, tìm trong bài đã lưu */}
      {items.length === 0 ? (
        <p className="status">Chưa có bài nào. Bấm “Đọc sau” ở bất kỳ bài viết nào để lưu.</p>
      ) : (
        <div className="list">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  );
}
