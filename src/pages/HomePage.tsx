import { getFeed } from '../services/rss';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';

export default function HomePage() {
  const state = useAsync(() => getFeed('trang-chu'), []);
  return (
    <>
      <h1>Tin mới nhất</h1>
      {/* TODO (TV1): bài nổi bật cỡ lớn + lưới tin theo chuyên mục như trang gốc */}
      <ArticleList state={state} />
    </>
  );
}
