import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import KeywordManager from '../components/KeywordManager';
import { getInitials } from '../components/UserMenu';
import { SUGGESTED_AUTHORS } from '../config/authors';
import { CATEGORIES } from '../config/categories';
import { useFollows } from '../hooks/useFollows';
import { useToggleSet } from '../hooks/useToggleSet';
import '../css/MyFeedPage.css';
import './auth.css';
import './profile.css';

type Tab = 'category' | 'author' | 'keyword';

const TABS: { id: Tab; label: string }[] = [
    { id: 'category', label: 'Chuyên mục' },
    { id: 'author', label: 'Tác giả' },
    { id: 'keyword', label: 'Từ khóa' },
];

const isTab = (value: string | null): value is Tab =>
    value === 'category' || value === 'author' || value === 'keyword';

function FollowButton({ on, onClick }: { on: boolean; onClick: () => void }) {
    return (
        <button type="button" className={`fs-follow${on ? ' is-on' : ''}`} aria-pressed={on} onClick={onClick}>
            {on ? 'Đang theo dõi' : '+ Theo dõi'}
        </button>
    );
}

export default function FeedSettingsPage() {
    const { keywords, add, remove, validate } = useFollows();
    const [params, setParams] = useSearchParams();
    const tabParam = params.get('tab');
    const tab: Tab = isTab(tabParam) ? tabParam : 'category';
    const [query, setQuery] = useState('');

    const [followedCats, toggleCat] = useToggleSet();
    const [followedAuthors, toggleAuthor] = useToggleSet();

    const changeTab = (id: Tab) => {
        setQuery('');
        setParams({ tab: id }, { replace: true });
    };

    const q = query.trim().toLowerCase();
    const categories = CATEGORIES.filter((c) => c.slug !== 'trang-chu').filter(
        (c) => !q || c.name.toLowerCase().includes(q)
    );
    const authors = SUGGESTED_AUTHORS.filter((a) => !q || a.name.toLowerCase().includes(q));

    return (
        <div className="acc">
            <AccountNav />

            <div className="acc-main">
                <nav className="fs-crumb" aria-label="Đường dẫn">
                    <Link to="/ban-tin-cua-toi">Bảng tin của bạn</Link>
                    <span aria-hidden="true">›</span>
                    <span>Thiết lập</span>
                </nav>
                <h1 className="acc-title fs-title">Thiết lập hiển thị</h1>

                <div className="fs-tabs" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === t.id}
                            className={`fs-tab${tab === t.id ? ' is-active' : ''}`}
                            onClick={() => changeTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'keyword' ? (
                    <KeywordManager keywords={keywords} onAdd={add} onRemove={remove} validate={validate} />
                ) : (
                    <>
                        <div className="fs-search">
                            <input
                                value={query}
                                placeholder={tab === 'author' ? 'Tìm kiếm tác giả..' : 'Tìm kiếm chuyên mục..'}
                                aria-label={tab === 'author' ? 'Tìm kiếm tác giả' : 'Tìm kiếm chuyên mục'}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="6.5" />
                                <path d="M16 16l4.5 4.5" />
                            </svg>
                        </div>

                        {tab === 'category' &&
                            (categories.length === 0 ? (
                                <p className="fs-empty">Không tìm thấy chuyên mục phù hợp.</p>
                            ) : (
                                <ul className="fs-list">
                                    {categories.map((c) => (
                                        <li key={c.slug} className="fs-row">
                                            <span className="fs-name">{c.name}</span>
                                            <FollowButton on={followedCats.has(c.slug)} onClick={() => toggleCat(c.slug)} />
                                        </li>
                                    ))}
                                </ul>
                            ))}

                        {tab === 'author' &&
                            (authors.length === 0 ? (
                                <p className="fs-empty">Không tìm thấy tác giả phù hợp.</p>
                            ) : (
                                <ul className="fs-list">
                                    {authors.map((a) => (
                                        <li key={a.id} className="fs-row">
                                            <span className="fs-person">
                                                <span className="fs-avatar" aria-hidden="true">
                                                    {getInitials(a.name)}
                                                </span>
                                                <span className="fs-name">{a.name}</span>
                                            </span>
                                            <FollowButton on={followedAuthors.has(a.id)} onClick={() => toggleAuthor(a.id)} />
                                        </li>
                                    ))}
                                </ul>
                            ))}
                    </>
                )}
            </div>
        </div>
    );
}