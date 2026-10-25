import { useParams, useSearchParams } from 'react-router-dom';
import { getArticle, timeAgo } from '../services/rss';
import { useAsync } from '../hooks/useAsync';
import BookmarkButton from '../components/BookmarkButton.jsx';

export default function ArticlePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data: a, loading, error } = useAsync(() => getArticle(id, params.get('c')), [id]);

  if (loading) return <p className="status">Đang tải bài viết...</p>;
  if (error || !a) return <p className="status error">Không tìm thấy bài viết trong RSS hiện tại.</p>;

  return (
    <article className="article">
      <h1>{a.title}</h1>
      <div className="meta">
        <span>{timeAgo(a.pubDate)}</span>
        <BookmarkButton article={a} />
      </div>
      {a.image && <img src={a.image} alt="" />}
      <p className="lead">{a.summary}</p>
      {/* TODO (TV3): hiển thị a.content (HTML từ rss2json) đã làm sạch, bài liên quan cùng chuyên mục,
          cỡ chữ/chế độ tối. RSS không có toàn văn nên luôn kèm link bài gốc. */}
      <p>
        <a href={a.link} target="_blank" rel="noreferrer">Đọc toàn bộ bài trên Dân trí</a>
      </p>
    </article>
  );
}
