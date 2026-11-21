import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchArticles } from '../services/rss';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import { getCategory } from '../config/categories';
import '../css/SearchPage.css';

const ITEMS_PER_PAGE = 12;

type TimeFilter = 'all' | '24h' | '7d' | '30d';

const TIME_LIMIT_MS: Record<Exclude<TimeFilter, 'all'>, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const state = useAsync(() => searchArticles(q), [q]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, selectedCategory, timeFilter]);

  const availableCategories = useMemo(() => {
    if (!state.data) return [];
    const categoriesSet = new Set(state.data.map((item) => item.category).filter(Boolean));
    return Array.from(categoriesSet);
  }, [state.data]);

  const processedArticles = useMemo(() => {
    if (!state.data) return [];

    const now = Date.now();
    let list = [...state.data];

    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (timeFilter !== 'all') {
      const maxAge = TIME_LIMIT_MS[timeFilter];
      list = list.filter((item) => {
        const pubTime = new Date(item.pubDate || 0).getTime();
        if (Number.isNaN(pubTime)) return false;
        return now - pubTime <= maxAge;
      });
    }

    return list;
  }, [state.data, selectedCategory, timeFilter]);

  const totalPages = Math.ceil(processedArticles.length / ITEMS_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [processedArticles, currentPage]);

  const filteredState = {
    ...state,
    data: paginatedArticles,
  };

  const hasFilter = selectedCategory !== 'all' || timeFilter !== 'all';

  return (
    <section className="sp-wrap">
      <div className="sp-top-row">
        <h1 className="sp-heading">
          Kết quả cho <span>“{q}”</span>
        </h1>
        {!state.loading && !state.error && (
          <p className="sp-count">
            Có <strong>{processedArticles.length}</strong> bài viết phù hợp
          </p>
        )}
      </div>

      <div className="sp-filters">
        <select
          className="sp-select"
          aria-label="Lọc theo chuyên mục"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Chuyên mục: Tất cả</option>
          {availableCategories.map((catSlug) => {
            const categoryInfo = getCategory(catSlug);
            return (
              <option key={catSlug} value={catSlug}>
                Chuyên mục: {categoryInfo?.name ?? catSlug}
              </option>
            );
          })}
        </select>

        <select
          className="sp-select"
          aria-label="Lọc theo thời gian"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
        >
          <option value="all">Thời gian: Tất cả</option>
          <option value="24h">Thời gian: 24 giờ qua</option>
          <option value="7d">Thời gian: 7 ngày qua</option>
          <option value="30d">Thời gian: 30 ngày qua</option>
        </select>

        {hasFilter && (
          <button
            type="button"
            className="sp-reset"
            onClick={() => {
              setSelectedCategory('all');
              setTimeFilter('all');
            }}
          >
            Xóa lọc
          </button>
        )}
      </div>

      <ArticleList state={filteredState} empty="Không có bài nào khớp từ khóa và bộ lọc." />

      {totalPages > 1 && (
        <nav className="sp-pagination" aria-label="Phân trang kết quả tìm kiếm">
          <button
            type="button"
            className="sp-page-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>

          <span className="sp-page-info">
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>

          <button
            type="button"
            className="sp-page-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Trang sau
          </button>
        </nav>
      )}
    </section>
  );
}