import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import ArticleCard from '../components/ArticleCard';
import FeedSidebar from '../components/FeedSidebar';
import { useFollows } from '../hooks/useFollows';
import { useUnreadFeed } from '../hooks/useUnreadFeed';
import { groupByKeyword } from '../services/feedGroups';
import { refreshAllFeeds } from '../services/rss';
import { REFRESH_INTERVAL_MS, shouldApplyRefresh } from '../services/feedRefresh';
import type { Article } from '../types';
import '../css/MyFeedPage.css';
import './auth.css';
import './profile.css';

export default function MyFeedPage() {
    const { keywords, add, remove } = useFollows();
    const [liveArticles, setLiveArticles] = useState<Article[] | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const {
        loading, error, articles, articleCount, matches, unread, unreadCount, hasFollows, sources,
    } = useUnreadFeed(liveArticles);
    const groups = useMemo(() => groupByKeyword(unread, sources), [unread, sources]);
    const articlesRef = useRef<Article[] | null>(articles);
    useEffect(() => {
        articlesRef.current = articles;
    }, [articles]);

    useEffect(() => {
        if (!hasFollows) {
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
    }, [hasFollows]);

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
                    Chưa có bài viết nào khớp với từ khóa hoặc chuyên mục bạn đang theo dõi. Hãy thử theo dõi thêm.
                </p>
            );
        }
        if (unreadCount === 0) {
            return <p className="status">Bạn đã đọc hết tin mới theo những gì bạn đang theo dõi.</p>;
        }
        return (
            <>
                <h2 className="myfeed-subtitle">{unreadCount} tin chưa đọc</h2>
                {groups.map((group) => (
                    <section key={group.keyword} className="myfeed-group" aria-label={group.keyword}>
                        <h3 className="myfeed-group-title">
                            <span>{group.keyword}</span>
                            <span className="myfeed-group-count">{group.items.length}</span>
                        </h3>
                        <div className="list">
                            {group.items.map(({ article, matched }) => (
                                <div key={article.id} className="myfeed-item">
                                    <ArticleCard article={article} />
                                    {matched.length > 1 && (
                                        <ul className="myfeed-matched" aria-label="Cũng khớp">
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
        <div className="acc acc-feed">
            <AccountNav />

            <div className="acc-main">
                <div className="vw-head">
                    <h1 className="acc-title vw-title">Bảng tin của bạn</h1>
                </div>
                {lastRefresh && (
                    <p className="feed-updated">Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}</p>
                )}

                {!hasFollows ? (
                    <div className="myfeed-empty">
                        <strong>Bạn chưa theo dõi từ khóa hay chuyên mục nào</strong>
                        Chọn nhanh một gợi ý ở bên phải, hoặc vào{' '}
                        <Link to="/ban-tin-cua-toi/thiet-lap">Thiết lập hiển thị</Link> để theo dõi.
                    </div>
                ) : (
                    <section aria-live="polite">{renderResults()}</section>
                )}
            </div>

            <FeedSidebar keywords={keywords} onAdd={add} onRemove={remove} />
        </div>
    );
}