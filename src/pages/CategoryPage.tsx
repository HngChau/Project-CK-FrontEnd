import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getFeed } from '../services/rss';
import { getCategory } from '../config/categories';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import Pagination from '../components/Pagination';

const ARTICLES_PER_PAGE = 12;

export default function CategoryPage() {
  {/* TODO (TV1): phân trang phía client (RSS trả một lần, tự cắt trang) */}
  const { slug = '' } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const cat = getCategory(slug);
  const state = useAsync(() => getFeed(slug), [slug]);

  // Đọc số trang từ URL
  const pageParam = Number(searchParams.get('page'));
  const currentPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const articles = state.data ?? [];

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (totalPages === 1) {
          next.delete('page');
        } else {
          next.set('page', String(totalPages));
        }
        return next;
      }, { replace: true });
    }
  }, [currentPage, totalPages, setSearchParams]);

  // Chuyển trang
  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);

    if (page <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(page));
    }

    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // lấy 12 bài mỗi trang
  const paginatedState = {
    ...state,
    data: (state.data ?? []).slice(
      (currentPage - 1) * ARTICLES_PER_PAGE,  
      currentPage * ARTICLES_PER_PAGE
    ),
  };

  if (!cat) return <p>Chuyên mục không tồn tại.</p>;

  return (
    <>
      <h1>{cat.name}</h1>

      <ArticleList state={paginatedState} />

      {!state.loading && !state.error && (
        <Pagination
          currentPage={Math.min(currentPage, Math.max(totalPages, 1))}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
