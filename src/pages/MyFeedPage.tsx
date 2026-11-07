import { useMemo } from 'react';
import { useFollows } from '../hooks/useFollows';
import { useAsync } from '../hooks/useAsync';
import { filterByKeywords, getAllFeeds } from '../services/rss';
import ArticleCard from '../components/ArticleCard';
import KeywordManager from '../components/KeywordManager';
import type { Article } from '../types';
import '../css/MyFeedPage.css';

export default function MyFeedPage() {
    const { keywords, add, remove, validate } = useFollows();

    // Tải và gộp tin từ mọi chuyên mục một lần (đã bỏ trùng, mới nhất trước), sau đó lọc ngay
    // trong bộ nhớ khi thêm/xóa từ khóa nên không phải tải lại
    const feeds = useAsync<Article[]>(() => getAllFeeds(), []);

    const matches = useMemo(
        () => (feeds.data ? filterByKeywords(feeds.data, keywords) : []),
        [feeds.data, keywords]
    );

    const renderResults = () => {
        if (feeds.loading) return <p className="status">Đang tải tin từ các chuyên mục...</p>;
        if (feeds.error) {
            return <p className="status error">Không tải được tin: {feeds.error.message}. Thử lại sau ít phút.</p>;
        }
        if (!feeds.data || feeds.data.length === 0) {
            return <p className="status error">Chưa lấy được tin từ các chuyên mục. Vui lòng thử lại sau ít phút.</p>;
        }
        if (matches.length === 0) {
            return (
                <p className="status">
                    Chưa có bài viết nào khớp với các từ khóa bạn đang theo dõi. Hãy thử thêm từ khóa khác.
                </p>
            );
        }
        return (
            <>
                <h2 className="myfeed-subtitle">{matches.length} bài viết phù hợp</h2>
                <div className="list">
                    {matches.map(({ article, matched }) => (
                        <div key={article.id} className="myfeed-item">
                            <ArticleCard article={article} />
                            <ul className="myfeed-matched" aria-label="Từ khóa khớp">
                                {matched.map((k) => (
                                    <li key={k}>{k}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="myfeed">
            <header className="myfeed-head">
                <h1>Bản tin của tôi</h1>
                <p>Theo dõi từ khóa để xem tin liên quan từ tất cả chuyên mục.</p>
            </header>

            <KeywordManager keywords={keywords} onAdd={add} onRemove={remove} validate={validate} />

            {keywords.length === 0 ? (
                <div className="myfeed-empty">
                    <strong>Bạn chưa theo dõi từ khóa nào</strong>
                    Nhập từ khóa ở trên hoặc chọn nhanh một gợi ý để bắt đầu nhận tin phù hợp.
                </div>
            ) : (
                <section aria-live="polite">{renderResults()}</section>
            )}
        </div>
    );
}