
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

  const rawPage = searchParams.get('page');
  const pageParam = Number(rawPage);

  const currentPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const articles = state.data ?? [];
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  // Kiểm tra và sửa số trang không hợp lệ trên URL
  useEffect(() => {
    if (rawPage === null) return;

    const next = new URLSearchParams(searchParams);

    if (!/^[1-9]\d*$/.test(rawPage)) {
      next.delete('page');
      setSearchParams(next, { replace: true });
      return;
    }

    if (state.loading || state.error) return;

    if (totalPages === 0) {
      next.delete('page');
      setSearchParams(next, { replace: true });
    } else if (currentPage > totalPages) {
      if (totalPages === 1) {
        next.delete('page');
      } else {
        next.set('page', String(totalPages));
      }

      setSearchParams(next, { replace: true });
    }
  }, [
    rawPage,
    searchParams,
    setSearchParams,
    state.loading,
    state.error,
    currentPage,
    totalPages,
  ]);

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

  // Lấy 12 bài viết mỗi trang
  const paginatedState = {
    ...state,
    data: articles.slice(
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
