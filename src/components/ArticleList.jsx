import ArticleCard from './ArticleCard.jsx';

export default function ArticleList({ state, empty = 'Chưa có bài viết.' }) {
  const { data, loading, error } = state;
  if (loading) return <p className="status">Đang tải tin...</p>;
  if (error) return <p className="status error">Không tải được tin: {error.message}. Thử lại sau ít phút.</p>;
  if (!data?.length) return <p className="status">{empty}</p>;
  return (
    <div className="list">
      {data.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  );
}
