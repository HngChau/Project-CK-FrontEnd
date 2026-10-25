import { useParams } from 'react-router-dom';
import { getFeed } from '../services/rss';
import { getCategory } from '../config/categories';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  const state = useAsync(() => getFeed(slug), [slug]);
  if (!cat) return <p>Chuyên mục không tồn tại.</p>;
  return (
    <>
      <h1>{cat.name}</h1>
      {/* TODO (TV1): phân trang phía client (RSS trả một lần, tự cắt trang) */}
      <ArticleList state={state} />
    </>
  );
}
