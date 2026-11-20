import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getInitials } from './UserMenu';
import { SUGGESTED_AUTHORS } from '../config/authors';
import { CATEGORIES } from '../config/categories';
import { keywordKey } from '../services/follows';
import type { AddResult } from '../services/follows';
import { useFollowList } from '../hooks/useFollowList';

// Mỗi khối gợi ý chỉ hiện 3 mục
const KEYWORD_SUGGESTIONS = ['giáo dục', 'bóng đá', 'công nghệ'];
const CATEGORY_SUGGESTIONS = CATEGORIES.filter((c) => c.slug !== 'trang-chu').slice(0, 3);
const AUTHOR_SUGGESTIONS = SUGGESTED_AUTHORS.slice(0, 3);

interface Props {
    keywords: string[];
    onAdd: (keyword: string) => AddResult;
    onRemove: (keyword: string) => void;
}

function SubHead({ title, tab }: { title: string; tab: 'keyword' | 'category' | 'author' }) {
    return (
        <div className="feed-sub-head">
            <h3>{title}</h3>
            <Link to={`/ban-tin-cua-toi/thiet-lap?tab=${tab}`}>Tất cả</Link>
        </div>
    );
}

export default function FeedSidebar({ keywords, onAdd, onRemove }: Props) {
    const [error, setError] = useState('');
    const [followedCats, toggleCat] = useFollowList('categories');
    const [followedAuthors, toggleAuthor] = useFollowList('authors');
    const isFollowed = (k: string) => keywords.some((x) => keywordKey(x) === keywordKey(k));

    // Từ khóa: bấm "+ Theo dõi" để theo dõi, bấm "Đang theo dõi" để bỏ theo dõi
    const toggleKeyword = (k: string) => {
        setError('');
        if (isFollowed(k)) {
            onRemove(k);
            return;
        }
        const result = onAdd(k);
        if (!result.ok) setError(result.error);
    };

    const followClass = (on: boolean) => `feed-follow${on ? ' is-on' : ''}`;
    const followText = (on: boolean) => (on ? 'Đang theo dõi' : '+ Theo dõi');

    return (
        <aside className="feed-side">
            <Link to="/ban-tin-cua-toi/thiet-lap" className="feed-settings">
                <span>Thiết lập hiển thị</span>
                <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 13V9a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h5" />
                    <path d="M8 10h8M8 15h4" />
                    <circle cx="23" cy="23" r="4" />
                    <circle cx="23" cy="23" r="1.5" />
                    <path d="M23 17.4v1.6M23 27v1.6M17.4 23H19M27 23h1.6M19.04 19.04l1.13 1.13M25.83 25.83l1.13 1.13M26.96 19.04l-1.13 1.13M20.17 25.83l-1.13 1.13" />
                </svg>
            </Link>

            <section aria-label="Gợi ý">
                <h2 className="feed-block-title">Gợi ý</h2>

                <div className="feed-sub">
                    <SubHead title="Gợi ý từ khóa" tab="keyword" />
                    <ul className="feed-suggest">
                        {KEYWORD_SUGGESTIONS.map((k) => {
                            const on = isFollowed(k);
                            return (
                                <li key={k}>
                                    <span>{k}</span>
                                    <button type="button" className={followClass(on)} aria-pressed={on} onClick={() => toggleKeyword(k)}>
                                        {followText(on)}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {error && <span className="feed-error">{error}</span>}
                </div>

                <div className="feed-sub">
                    <SubHead title="Gợi ý chuyên mục" tab="category" />
                    <ul className="feed-suggest">
                        {CATEGORY_SUGGESTIONS.map((c) => {
                            const on = followedCats.has(c.slug);
                            return (
                                <li key={c.slug}>
                                    <span>{c.name}</span>
                                    <button type="button" className={followClass(on)} aria-pressed={on} onClick={() => toggleCat(c.slug)}>
                                        {followText(on)}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="feed-sub">
                    <SubHead title="Gợi ý tác giả" tab="author" />
                    <ul className="feed-authors">
                        {AUTHOR_SUGGESTIONS.map((a) => {
                            const on = followedAuthors.has(a.id);
                            return (
                                <li key={a.id}>
                                    <span className="feed-avatar" aria-hidden="true">
                                        {getInitials(a.name)}
                                    </span>
                                    <span className="feed-author-name">{a.name}</span>
                                    <button type="button" className={followClass(on)} aria-pressed={on} onClick={() => toggleAuthor(a.id)}>
                                        {followText(on)}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </aside>
    );
}