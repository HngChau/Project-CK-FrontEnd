import { useMemo } from 'react';
import { useFollows } from '../hooks/useFollows';
import { useAsync } from '../hooks/useAsync';
import { getAllFeeds, removeAccents } from '../services/rss';
import { keywordKey } from '../services/follows';
import ArticleList from '../components/ArticleList';
import KeywordManager from '../components/KeywordManager';
import type { Article, AsyncState } from '../types';
import '../css/MyFeedPage.css';
import AccountNav from '../components/AccountNav';
import './auth.css';
import './profile.css';

// giao diện quản lý từ khóa và trang Bản tin của tôi
export default function MyFeedPage() {
    const { keywords, add, remove, validate } = useFollows();

    // Tải tin từ mọi chuyên mục một lần, sau đó lọc ngay trong bộ nhớ khi thêm/xóa từ khóa
    const feeds = useAsync<Article[]>(() => getAllFeeds(), []);
    const matched = useMemo<Article[]>(() => {
        if (!feeds.data || keywords.length === 0) return [];
        const keys = keywords.map(keywordKey);
        return feeds.data.filter((a) => {
            const text = removeAccents(`${a.title} ${a.summary}`);
            return keys.some((k) => text.includes(k));
        });
    }, [feeds.data, keywords]);

    const resultState: AsyncState<Article[]> = {
        data: matched,
        loading: feeds.loading,
        error: feeds.error,
    };

    return (
        <div className="acc">
            <AccountNav />
            <div className="acc-main">

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
                <section aria-live="polite">
                    {!feeds.loading && matched.length > 0 && (
                        <h2 className="myfeed-subtitle">{matched.length} bài viết phù hợp</h2>
                    )}
                    <ArticleList
                        state={resultState}
                        empty="Chưa có bài viết nào khớp với các từ khóa bạn đang theo dõi. Hãy thử thêm từ khóa khác."
                    />
                </section>
            )}
        </div>
            </div>
        </div>
    );
}