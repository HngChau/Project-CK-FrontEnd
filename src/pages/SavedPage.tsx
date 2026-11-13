import { useState } from 'react';
import { Link } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import { useBookmarks } from '../hooks/useBookmarks';
import type { Article } from '../types';
import { getCategory } from '../config/categories';
import './auth.css';
import './profile.css';
import CollectionList from '../components/CollectionList';
import type { Selection } from '../components/CollectionList';
import { useCollections } from '../hooks/useCollections';

const DATE_OPTS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

function formatDate(value: string | number): string {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN', DATE_OPTS);
}

// CHỨC NĂNG MỚI 1 (TV2)
export default function SavedPage() {
    const { items, toggle } = useBookmarks();
    const [toast, setToast] = useState('');
    const { collections, createCollection, renameCollection, deleteCollection } = useCollections();
    const [selected, setSelected] = useState<Selection>('all');

    const showToast = (msg: string) => {
        setToast(msg);
        window.setTimeout(() => setToast(''), 2500);
    };

    const handleShare = async (article: Article) => {
        const url = article.link;
        try {
            if (navigator.share) {
                await navigator.share({ title: article.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            showToast('Đã sao chép liên kết bài viết');
        } catch {
            /* người dùng bấm hủy chia sẻ, bỏ qua */
        }
    };

    const handleUnsave = (article: Article) => {
        toggle(article);
        showToast('Đã bỏ lưu bài viết');
    };

    function articlePath(a: Article): string {
        try {
            const url = new URL(a.link);
            const parts = url.pathname.split('/').filter(Boolean);
            // /chuyen-muc/ten-bai-123.htm đã có chuyên mục trong đường dẫn
            if (parts.length >= 2) return url.pathname;
            // chỉ có /ten-bai-123.htm thì bổ sung ?c= từ category
            return a.category ? `${url.pathname}?c=${a.category}` : url.pathname;
        } catch {
            return '/';
        }
    }
    function categoryName(slug?: string): string {
        const cat = slug ? getCategory(slug) : undefined;
        // Không hiển thị "Trang chủ" như một chuyên mục bài viết (giống ArticlePage)
        return cat && cat.slug !== 'trang-chu' ? cat.name : '';
    }

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
                    <h1 className="acc-title vw-title">Tin đã lưu</h1>
                </div>

                {/* TODO (TV2): bộ sưu tập (tạo/đổi tên/xóa), chuyển bài giữa bộ sưu tập, ghi chú từng bài, tìm trong bài đã lưu */}
                <CollectionList
                    collections={collections}
                    selected={selected}
                    onSelect={setSelected}
                    onCreate={createCollection}
                    onRename={renameCollection}
                    onDelete={deleteCollection}
                />

                {items.length === 0 ? (
                    <div className="vw-empty">
                        <p>Chưa có bài nào. Bấm “Đọc sau” ở bất kỳ bài viết nào để lưu.</p>
                        <Link to="/" className="vw-empty-link">Về trang chủ để đọc tin</Link>
                    </div>
                ) : (
                    <section className="vw-group">
                        <ul className="vw-list">
                            {items.map((a) => (
                                <li key={a.id} className="vw-item">
                                    <Link to={articlePath(a)} className="vw-thumb" tabIndex={-1} aria-hidden="true">
                                        {a.image ? <img src={a.image} alt="" loading="lazy" /> : <span />}
                                    </Link>

                                    <div className="vw-info">
                                        <Link to={articlePath(a)} className="vw-name">{a.title}</Link>

                                        <div className="vw-foot">
                                            <span className="vw-meta">
                                                {categoryName(a.category) ? `${categoryName(a.category)} - ` : ''}
                                                {formatDate(a.pubDate)}
                                            </span>

                                            <div className="vw-actions">
                                                <button
                                                    type="button"
                                                    className="vw-action"
                                                    onClick={() => handleShare(a)}
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
                                                    className="vw-action is-saved"
                                                    onClick={() => handleUnsave(a)}
                                                    aria-label="Bỏ lưu bài viết"
                                                    aria-pressed="true"
                                                    title="Bỏ lưu"
                                                >
                                                    <svg viewBox="0 0 24 24" width="24" height="24"
                                                         fill="currentColor" stroke="currentColor" strokeWidth="1.6"
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
                )}
            </div>
        </div>
    );
}