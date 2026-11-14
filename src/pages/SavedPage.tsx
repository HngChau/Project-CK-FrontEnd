import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import { useBookmarks } from '../hooks/useBookmarks';
import type { Article } from '../types';
import { getCategory } from '../config/categories';
import './auth.css';
import './profile.css';
import CollectionList from '../components/CollectionList';
import type { Selection } from '../components/CollectionList';
import { NOTE_MAX, useCollections } from '../hooks/useCollections';

const DATE_OPTS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

function formatDate(value: string | number): string {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN', DATE_OPTS);
}

interface ArticleNoteProps {
    value: string;
    onSave: (text: string) => void;
}

// Ghi chú của một bài có 3 trạng thái là chưa có, đang nhập và đã có
function ArticleNote({ value, onSave }: ArticleNoteProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const areaRef = useRef<HTMLTextAreaElement>(null);

    // Ô nhập tự cao thêm khi gõ nhiều dòng
    useEffect(() => {
        const el = areaRef.current;
        if (!editing || !el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [editing, draft]);

    // Mở ô nhập thì đặt con trỏ ở cuối chữ
    useEffect(() => {
        const el = areaRef.current;
        if (!editing || !el) return;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
    }, [editing]);

    const canSave = draft.trim() !== '' && draft.trim() !== value.trim();

    const startEdit = () => {
        setDraft(value);
        setEditing(true);
    };

    const cancel = () => {
        setDraft(value);
        setEditing(false);
    };

    const save = () => {
        if (!canSave) return;
        onSave(draft.trim());
        setEditing(false);
    };

    const remove = () => {
        if (!window.confirm('Xóa ghi chú của bài này?')) return;
        onSave('');
    };

    // Đang nhập ghi chú
    if (editing) {
        return (
            <div className="note-edit">
                <textarea
                    ref={areaRef}
                    rows={2}
                    value={draft}
                    maxLength={NOTE_MAX}
                    placeholder="Ghi chú của bạn về bài này..."
                    aria-label="Ghi chú"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') cancel();
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
                    }}
                />
                <div className="note-edit-foot">
                    <span className="note-hint">Ctrl + Enter để lưu, Esc để hủy</span>
                    {/* Bộ đếm chỉ hiện khi gần hết giới hạn */}
                    {draft.length >= NOTE_MAX - 100 && (
                        <span className="note-count">
                            {draft.length}/{NOTE_MAX}
                        </span>
                    )}
                    <div className="note-buttons">
                        <button type="button" onClick={cancel}>
                            Hủy
                        </button>
                        <button type="button" className="is-primary" onClick={save} disabled={!canSave}>
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Đã có ghi chú
    if (value) {
        return (
            <div className="note-view">
                <p className="note-text">{value}</p>
                <span className="note-ops">
                    <button type="button" onClick={startEdit}>
                        Sửa
                    </button>

                    <button type="button" className="is-danger" onClick={remove}>
                        Xóa
                    </button>
                </span>
            </div>
        );
    }

    // Chưa có ghi chú
    return (
        <button type="button" className="note-add" onClick={startEdit}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17z" />
                <path d="M13.5 6.5l3 3" />
            </svg>
            Thêm ghi chú
        </button>
    );
}

// CHỨC NĂNG MỚI 1 (TV2)
export default function SavedPage() {
    const { items, toggle } = useBookmarks();
    const [toast, setToast] = useState('');
    const { collections,assignments, notes, createCollection, renameCollection, deleteCollection, moveArticle, setNote, } = useCollections();
    const [selected, setSelected] = useState<Selection>('all');

    // Bộ sưu tập
    const keyOf = (a: Article) => String(a.id);
    const validIds = new Set(collections.map((c) => c.id));

    // Chip đang chọn bị xóa (hoặc không còn hợp lệ) thì quay về "Tất cả"
    const active =
        selected === 'all' || selected === 'none' || validIds.has(selected) ? selected : 'all';

    // Bộ sưu tập của một bài: 'none' nếu chưa xếp hoặc bộ sưu tập đó đã bị xóa
    const collectionOf = (a: Article): string => {
        const cid = assignments[keyOf(a)];
        return cid && validIds.has(cid) ? cid : 'none';
    };

    const counts: Record<string, number> = { all: items.length, none: 0 };
    for (const a of items) {
        const key = collectionOf(a);
        counts[key] = (counts[key] ?? 0) + 1;
    }

    const visible = items.filter((a) => active === 'all' || collectionOf(a) === active);
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
                    selected={active}
                    counts={counts}
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
                ) : visible.length === 0 ? (
                    <div className="vw-empty">
                        <p>Chưa có bài nào trong mục này. Chọn “Bộ sưu tập” ở từng bài để chuyển vào đây.</p>
                    </div>
                ) : (
                    <section className="vw-group">
                        <ul className="vw-list">
                            {visible.map((a) => (
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

                                        {/* Chọn bộ sưu tập cho bài này */}
                                        <div className="vw-extra">
                                            <label className="move-select">
                                                Bộ sưu tập:
                                                <select
                                                    value={collectionOf(a)}
                                                    onChange={(e) =>
                                                        moveArticle(keyOf(a), e.target.value === 'none' ? null : e.target.value)
                                                    }
                                                >
                                                    <option value="none">Chưa phân loại</option>
                                                    {collections.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <ArticleNote value={notes[keyOf(a)] ?? ''} onSave={(text) => setNote(keyOf(a), text)} />
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