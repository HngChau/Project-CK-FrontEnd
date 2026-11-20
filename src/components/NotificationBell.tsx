import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { getUserComments } from '../hooks/useComments';
import { useFollows } from '../hooks/useFollows';
import { useUnreadFeed } from '../hooks/useUnreadFeed';
import { getCategory } from '../config/categories';
import { articlePath, formatNotificationMeta } from '../services/format';
import { formatBadge } from '../services/readState';
import { timeAgo } from '../services/rss';
import '../css/NotificationBell.css';

type Tab = 'news' | 'comments';

const MAX_NEWS = 30; // số thông báo tối đa hiện trong khung
const MAX_COMMENTS = 10;

const svgProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

interface EmptyProps {
    title: string;
    hint: string;
    to: string;
    label: string;
    onNavigate: () => void;
}

function Empty({ title, hint, to, label, onNavigate }: EmptyProps) {
    return (
        <div className="bell-empty">
            <strong>{title}</strong>
            {hint}
            <br />
            <Link to={to} onClick={onNavigate}>
                {label}
            </Link>
        </div>
    );
}

export default function NotificationBell() {
    const { user } = useAuth();
    const { keywords } = useFollows();
    const { loading, error, articleCount, unread, unreadCount } = useUnreadFeed();
    const { isSaved, toggle } = useBookmarks();
    const location = useLocation();

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('news');
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const routeKey = location.pathname + location.search;

    useEffect(() => {
        setOpen(false);
    }, [routeKey]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    // Bình luận: đọc lại mỗi lần mở khung hoặc chuyển sang tab
    const comments = useMemo(
        () => (open && tab === 'comments' && user ? getUserComments(user.id).slice(0, MAX_COMMENTS) : []),
        [open, tab, user]
    );

    if (!user) return null;

    const close = () => setOpen(false);
    const badge = formatBadge(unreadCount);
    const label = badge ? `Thông báo, ${unreadCount} tin chưa đọc` : 'Thông báo';

    const renderNews = () => {
        if (keywords.length === 0) {
            return (
                <Empty
                    title="Bạn chưa theo dõi từ khóa nào"
                    hint="Theo dõi từ khóa để nhận thông báo khi có tin mới."
                    to="/ban-tin-cua-toi"
                    label="Theo dõi từ khóa"
                    onNavigate={close}
                />
            );
        }
        if (loading) return <p className="bell-empty">Đang tải thông báo...</p>;
        if (error || articleCount === 0) {
            return <p className="bell-empty">Chưa lấy được tin. Vui lòng thử lại sau ít phút.</p>;
        }
        if (unreadCount === 0) {
            return (
                <Empty
                    title="Bạn không có thông báo mới"
                    hint="Tin mới theo từ khóa bạn theo dõi sẽ hiện ở đây."
                    to="/ban-tin-cua-toi"
                    label="Mở Bản tin của tôi"
                    onNavigate={close}
                />
            );
        }
        return (
            <>
                <ul className="bell-list">
                    {unread.slice(0, MAX_NEWS).map(({ article }) => {
                        const category = getCategory(article.category);
                        const meta = formatNotificationMeta(
                            category && category.slug !== 'trang-chu' ? category.name : '',
                            article.pubDate
                        );
                        const saved = isSaved(article.id);
                        return (
                            <li key={article.id} className="bell-item">
                                <Link to={articlePath(article)} className="bell-item-title" onClick={close}>
                                    {article.title}
                                </Link>
                                <span className="bell-item-meta">{meta}</span>
                                <button
                                    type="button"
                                    className={`bell-save${saved ? ' is-saved' : ''}`}
                                    aria-pressed={saved}
                                    aria-label={saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết để đọc sau'}
                                    title={saved ? 'Bỏ lưu' : 'Đọc sau'}
                                    onClick={() => toggle(article)}>
                                    <svg {...svgProps} width="22" height="22" strokeWidth="1.7" fill={saved ? 'currentColor' : 'none'}>
                                        <path d="M6 3h12v18l-6-4-6 4z" />
                                    </svg>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <Link to="/ban-tin-cua-toi" className="bell-more" onClick={close}>
                    Xem tất cả trong Bản tin của tôi
                </Link>
            </>
        );
    };

    const renderComments = () => {
        if (comments.length === 0) {
            return (
                <Empty
                    title="Bạn chưa có bình luận nào"
                    hint="Bình luận của bạn ở các bài viết sẽ hiện ở đây."
                    to="/hoat-dong-binh-luan"
                    label="Mở hoạt động bình luận"
                    onNavigate={close}
                />
            );
        }
        return (
            <>
                <ul className="bell-list">
                    {comments.map((c) => (
                        <li key={`${c.articleId}-${c.id}`} className="bell-item bell-item-comment">
                            <Link
                                to={c.articlePath ?? `/bai-viet/${c.articleId}`}
                                className="bell-item-title"
                                onClick={close}>
                                {c.articleTitle ?? 'Bài viết đã bình luận'}
                            </Link>
                            <p className="bell-comment-text">{c.content}</p>
                            <span className="bell-item-meta">{timeAgo(new Date(c.createdAt).toISOString())}</span>
                        </li>
                    ))}
                </ul>
                <Link to="/hoat-dong-binh-luan" className="bell-more" onClick={close}>
                    Xem tất cả hoạt động bình luận
                </Link>
            </>
        );
    };

    return (
        <div className="bell" ref={rootRef}>
            <button
                ref={buttonRef}
                type="button"
                className="bell-btn"
                aria-label={label}
                title={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls="bell-panel"
                onClick={() => setOpen((v) => !v)}>
                <svg {...svgProps} width="22" height="22" strokeWidth="1.8">
                    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {badge && (
                    <span className="bell-badge" aria-hidden="true">
            {badge}
          </span>
                )}
            </button>

            {open && (
                <div id="bell-panel" className="bell-panel" role="dialog" aria-label="Thông báo">
                    <div className="bell-tabs" role="tablist" aria-label="Loại thông báo">
                        <button
                            type="button"
                            role="tab"
                            id="bell-tab-news"
                            aria-selected={tab === 'news'}
                            aria-controls="bell-body"
                            className={`bell-tab${tab === 'news' ? ' is-active' : ''}`}
                            onClick={() => setTab('news')}>
                            <svg {...svgProps} width="28" height="28" strokeWidth="1.6">
                                <path d="M20 12v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h6" />
                                <circle cx="19" cy="5" r="2" />
                                <path d="M8 11h8M8 15h5" />
                            </svg>
                            <span>Thông báo</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            id="bell-tab-comments"
                            aria-selected={tab === 'comments'}
                            aria-controls="bell-body"
                            className={`bell-tab${tab === 'comments' ? ' is-active' : ''}`}
                            onClick={() => setTab('comments')}>
                            <svg {...svgProps} width="28" height="28" strokeWidth="1.6">
                                <rect x="3" y="4" width="18" height="14" rx="3" />
                                <path d="M7 9h10M7 13h6M9 18v3l4-3" />
                            </svg>
                            <span>Bình luận</span>
                        </button>
                    </div>

                    <div
                        id="bell-body"
                        className="bell-body"
                        role="tabpanel"
                        aria-labelledby={tab === 'news' ? 'bell-tab-news' : 'bell-tab-comments'}>
                        {tab === 'news' ? renderNews() : renderComments()}
                    </div>
                </div>
            )}
        </div>
    );
}