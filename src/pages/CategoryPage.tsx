
import { useEffect } from 'react';
import { Link,useParams, useSearchParams } from 'react-router-dom';
import { getFeed } from '../services/rss';
import { getCategory, CATEGORY_HOVER_ITEMS } from '../config/categories';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import Pagination from '../components/Pagination';
import '../css/CategoryPage.css';

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

  const subCategories = CATEGORY_HOVER_ITEMS?.[slug] ?? [];//Chuyên mục con

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

  if (!cat){
    return (
      <div className="cp-not-found">
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
          Chuyên mục không tồn tại.
        </p>
        <Link to="/" className="cp-not-found-link">
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="cp-wrap">
      {/* Đường dẫn điều hướng nhỏ */}
      <nav aria-label="Breadcrumb" className="cp-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{cat.name}</span>
      </nav>

      {/* Tiêu đề chuyên mục + chuyên mục con */}
      <header className="cp-header">
        <div className="cp-title-group">
          <h1 className="cp-title">{cat.name}</h1>
          {!state.loading && !state.error && articles.length > 0 && (
            <span className="cp-count">({articles.length} tin)</span>
          )}
        </div>

        {subCategories.length > 0 && (
          <div className="cp-subnav">
            {subCategories.map((sub) => (
              <Link
                key={sub.slug}
                to={`/chuyen-muc/${sub.slug}`}
                className="cp-subchip"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Danh sách bài viết */}
      <main className="cp-list-area">
        <ArticleList state={paginatedState} />
      </main>

      {/* Phân trang */}
      {!state.loading && !state.error && totalPages > 1 && (
        <div className="cp-pagination-wrap">
          <Pagination
            currentPage={Math.min(currentPage, Math.max(totalPages, 1))}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
