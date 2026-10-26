import { useSearchParams } from 'react-router-dom';
import { searchArticles } from '../services/rss';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const state = useAsync(() => searchArticles(q), [q]);
  return (
    <>
      <h1>Kết quả cho “{q}”</h1>
      {/* TODO (TV1): lọc theo chuyên mục, sắp xếp theo thời gian */}
      <ArticleList state={state} empty="Không có bài nào khớp từ khóa." />
    </>
  );
}
