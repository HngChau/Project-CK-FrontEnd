import { useState } from 'react';
import { Link } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import { useAuth } from '../context/AuthContext';
import { getViewed } from '../services/viewed';
import type { ViewedItem } from '../services/viewed';
import { useBookmarks } from '../hooks/useBookmarks';
import './auth.css';
import './profile.css';
import type { Article } from '../types';
const DATE_OPTS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('vi-VN', DATE_OPTS);
}

function groupLabel(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Hôm nay';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return formatDate(ts);
}

interface Group {
    label: string;
    items: ViewedItem[];
}

function groupByDay(items: ViewedItem[]): Group[] {
    const groups: Group[] = [];
    for (const item of items) {
        const label = groupLabel(item.viewedAt);
        const last = groups[groups.length - 1];
        if (last && last.label === label) last.items.push(item);
        else groups.push({ label, items: [item] });
    }
    return groups;
}

export default function ViewedPage() {
    const { user } = useAuth();
    const [items] = useState<ViewedItem[]>(() => (user ? getViewed(user.email) : []));
    const [toast, setToast] = useState('');
    const { isSaved, toggle } = useBookmarks();

    if (!user) return null;

    const showToast = (msg: string) => {
        setToast(msg);
        window.setTimeout(() => setToast(''), 2500);
    };

    const handleShare = async (item: ViewedItem) => {
        const url = new URL(item.to, window.location.origin).href;
        try {
            if (navigator.share) {
                await navigator.share({ title: item.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            showToast('Đã sao chép liên kết bài viết');
        } catch {
            /* người dùng bấm hủy chia sẻ, bỏ qua */
        }
    };

    const handleToggleSave = (item: ViewedItem) => {
        let article = item.article;

        if (!article) {
            // Bài xem trước đây chưa có bản đầy đủ: dựng tạm từ dữ liệu đã có
            const url = new URL(item.to, window.location.origin);
            const parts = url.pathname.split('/').filter(Boolean);
            const categorySlug = url.searchParams.get('c') || (parts.length === 2 ? parts[0] : '');

            article = {
                id: item.id,
                title: item.title,
                summary: '',
                content: '',
                image: item.image ?? '',
                link: url.href,
                pubDate: new Date(item.viewedAt).toISOString(),
                category: categorySlug,
            } as Article;
        }

        toggle(article);
    };
    const groups = groupByDay(items);

    return (
        <div className="acc">
            <AccountNav />

            <div className="acc-main">
                {toast && (
                    <p className="auth-success" role="status">
                        {toast}
                    </p>
                )}

                <div className="vw-head">
                    <h1 className="acc-title vw-title">Tin đã xem</h1>
                </div>

                {items.length === 0 ? (
                    <div className="vw-empty">
                        <p>Bạn chưa xem tin nào.</p>
                        <Link to="/" className="vw-empty-link">Về trang chủ để đọc tin</Link>
                    </div>
                ) : (
                    groups.map((group) => (
                        <section key={group.label} className="vw-group">
                            <h2 className="vw-group-title">
                                <span>{group.label}</span>
                            </h2>

                            <ul className="vw-list">
                                {group.items.map((item) => (
                                    <li key={item.id} className="vw-item">
                                        <Link to={item.to} className="vw-thumb" tabIndex={-1} aria-hidden="true">
                                            {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span />}
                                        </Link>

                                        <div className="vw-info">
                                            <Link to={item.to} className="vw-name">{item.title}</Link>

                                            <div className="vw-foot">
                                                <span className="vw-meta">
                                                    {item.category ? `${item.category} - ` : ''}
                                                    {formatDate(item.viewedAt)}
                                                </span>

                                                <div className="vw-actions">
                                                    <button
                                                        type="button"
                                                        className="vw-action"
                                                        onClick={() => handleShare(item)}
                                                        aria-label="Chia sẻ bài viết"
                                                        title="Chia sẻ"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                                                             stroke="currentColor" strokeWidth="1.6"
                                                             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                            <path d="M14 4l7 6.5-7 6.5v-4c-5 0-8.5 1.5-11 5 .5-6 4-10 11-10.5z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`vw-action${isSaved(item.id) ? ' is-saved' : ''}`}
                                                        onClick={() => handleToggleSave(item)}
                                                        aria-label={isSaved(item.id) ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                                                        aria-pressed={isSaved(item.id)}
                                                        title={isSaved(item.id) ? 'Bỏ lưu' : 'Lưu bài viết'}
                                                    >
                                                        <svg viewBox="0 0 24 24" width="24" height="24"
                                                             fill={isSaved(item.id) ? 'currentColor' : 'none'}
                                                             stroke="currentColor" strokeWidth="1.6"
                                                             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                            <path d="M6 3h12v18l-6-4.5L6 21z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
