import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchArticles } from '../services/rss';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import { getCategory } from '../config/categories';

const ITEMS_PER_PAGE = 12;

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const state = useAsync(() => searchArticles(q), [q]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, selectedCategory, sortOrder]);

  const availableCategories = useMemo(() => {
    if (!state.data) return [];
    const categoriesSet = new Set(state.data.map((item) => item.category).filter(Boolean));
    return Array.from(categoriesSet);
  }, [state.data]);

  const processedArticles = useMemo(() => {
    if (!state.data) return [];

    let list = [...state.data];

    //Lọc theo chuyên mục
    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    //Sắp xếp theo thời gian
    list.sort((a, b) => {
      const timeA = new Date(a.pubDate || 0).getTime();
      const timeB = new Date(b.pubDate || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [state.data, selectedCategory, sortOrder]);

  const totalPages = Math.ceil(processedArticles.length / ITEMS_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [processedArticles, currentPage]);

  const filteredState = {
    ...state,
    data: paginatedArticles,
  };

  return (
    <div className="search-page" style={{ padding: '16px 0' }}>
      <h1>Kết quả cho “{q}”</h1>

      <div 
        className="search-toolbar" 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          margin: '16px 0 24px 0', 
          alignItems: 'center', 
          flexWrap: 'wrap' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Chuyên mục:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="all">Tất cả chuyên mục</option>
            {availableCategories.map((catSlug) => {
              // Dịch slug (vd: 'giao-duc') sang tên tiếng Việt (vd: 'Giáo dục')
              const categoryInfo = getCategory(catSlug);
              return (
                <option key={catSlug} value={catSlug}>
                  {categoryInfo?.name ?? catSlug}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Sắp xếp:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="newest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
          </select>
        </div>
      </div>

      <ArticleList state={filteredState} empty="Không có bài nào khớp từ khóa và bộ lọc." />

      {totalPages > 1 && (
        <div 
          className="pagination-controls" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '32px' 
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: currentPage === 1 ? '#f1f5f9' : '#fff',
              color: currentPage === 1 ? '#94a3b8' : '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Trang trước
          </button>

          <span style={{ fontSize: '0.85rem', color: '#475569', padding: '0 8px' }}>
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: currentPage === totalPages ? '#f1f5f9' : '#fff',
              color: currentPage === totalPages ? '#94a3b8' : '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}