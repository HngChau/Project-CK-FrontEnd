import { useEffect, useMemo, useRef, useState } from 'react';
import { useFollows } from '../hooks/useFollows';
import { useUnreadFeed } from '../hooks/useUnreadFeed';
import { groupByKeyword } from '../services/feedGroups';
import { refreshAllFeeds } from '../services/rss';
import { REFRESH_INTERVAL_MS, shouldApplyRefresh } from '../services/feedRefresh';
import type { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import KeywordManager from '../components/KeywordManager';
import '../css/MyFeedPage.css';

export default function MyFeedPage() {
    const { keywords, add, remove, validate } = useFollows();
    const [liveArticles, setLiveArticles] = useState<Article[] | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const { loading, error, articles, articleCount, matches, unread, unreadCount } =
        useUnreadFeed(liveArticles);
    const groups = useMemo(() => groupByKeyword(unread, keywords), [unread, keywords]);
    const hasKeywords = keywords.length > 0;
    const articlesRef = useRef<Article[] | null>(articles);
    useEffect(() => {
        articlesRef.current = articles;
    }, [articles]);

    useEffect(() => {
        if (!hasKeywords) {
            setLiveArticles(null);
            setLastRefresh(null);
            return;
        }

        let cancelled = false;
        let busy = false;

        const timer = setInterval(async () => {
            console.log('[3.5] tick', { hidden: document.hidden, busy });
            if (busy || document.hidden) return; // bỏ qua nếu đang chạy hoặc tab đang ẩn
            busy = true;
            try {
                const next = await refreshAllFeeds();
                const apply = shouldApplyRefresh(articlesRef.current, next);
                console.log('[3.5] đã lấy', next.length, 'bài, áp dụng:', apply);
                if (!cancelled) {
                    setLastRefresh(new Date());
                    if (apply) setLiveArticles(next);
                }
            } catch (err) {
                console.warn('Làm mới tự động thất bại, giữ dữ liệu hiện tại:', err);
            } finally {
                busy = false;
            }
        }, REFRESH_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [hasKeywords]);

    const renderResults = () => {
        if (loading) return <p className="status">Đang tải tin từ các chuyên mục...</p>;
        if (error) {
            return <p className="status error">Không tải được tin: {error.message}. Thử lại sau ít phút.</p>;
        }
        if (articleCount === 0) {
            return <p className="status error">Chưa lấy được tin từ các chuyên mục. Vui lòng thử lại sau ít phút.</p>;
        }
        if (matches.length === 0) {
            return (
                <p className="status">
                    Chưa có bài viết nào khớp với các từ khóa bạn đang theo dõi. Hãy thử thêm từ khóa khác.
                </p>
            );
        }
        if (unreadCount === 0) {
            return <p className="status">Bạn đã đọc hết tin mới theo các từ khóa đang theo dõi.</p>;
        }
        return (
            <>
                <h2 className="myfeed-subtitle">{unreadCount} tin chưa đọc</h2>
                {groups.map((group) => (
                    <section key={group.keyword} className="myfeed-group" aria-label={`Từ khóa ${group.keyword}`}>
                        <h3 className="myfeed-group-title">
                            <span>{group.keyword}</span>
                            <span className="myfeed-group-count">{group.items.length}</span>
                        </h3>
                        <div className="list">
                            {group.items.map(({ article, matched }) => (
                                <div key={article.id} className="myfeed-item">
                                    <ArticleCard article={article} />
                                    {matched.length > 1 && (
                                        <ul className="myfeed-matched" aria-label="Cũng khớp từ khóa">
                                            <li className="myfeed-matched-label">Cũng khớp:</li>
                                            {matched.slice(1).map((k) => (
                                                <li key={k}>{k}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </>
        );
    };

    return (
        <div className="myfeed">
            <header className="myfeed-head">
                <h1>Bản tin của tôi</h1>
                <p>Theo dõi từ khóa để xem tin chưa đọc liên quan từ tất cả chuyên mục.</p>
                {lastRefresh && (
                    <p className="kw-none">Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}</p>
                )}
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