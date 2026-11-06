import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComments } from '../../hooks/useComments';
import { timeAgo } from '../../services/rss';

const MAX_LENGTH = 1000;

interface Props {
    articleId: string;
    articleTitle: string;
}

export default function CommentSection({ articleId, articleTitle }: Props) {
    const { user } = useAuth();
    const { comments, add, remove } = useComments(articleId);
    const navigate = useNavigate();
    const location = useLocation();
    const [text, setText] = useState('');
    const [sent, setSent] = useState(false);

    // Chuyển sang bài khác thì bỏ nội dung đang gõ dở.
    useEffect(() => {
        setText('');
        setSent(false);
    }, [articleId]);

    // Tự ẩn thông báo thành công sau 4 giây.
    useEffect(() => {
        if (!sent) return;
        const timer = setTimeout(() => setSent(false), 4000);
        return () => clearTimeout(timer);
    }, [sent]);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user || !text.trim()) return;
        // Lưu kèm tiêu đề và đường dẫn bài để trang cá nhân hiển thị được hoạt động bình luận.
        add(user.id, user.name, text, {
            title: articleTitle,
            path: location.pathname + location.search,
        });
        setText('');
        setSent(true);
    };

    const openLogin = () =>
        navigate('/dang-nhap', {
            state: { backgroundLocation: location, from: location.pathname + location.search },
        });

    return (
        <section className="art-comments" id="binh-luan" aria-label="Bình luận">
            <h2>Bình luận ({comments.length})</h2>

            {user ? (
                <form className="art-comment-form" onSubmit={submit}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Viết bình luận của bạn?"
                        maxLength={MAX_LENGTH}
                        rows={3}
                        aria-label="Nội dung bình luận"
                    />
                    <div className="art-comment-actions">
                        <span className="art-comment-count">{text.length}/{MAX_LENGTH}</span>
                        <button type="submit" disabled={!text.trim()}>Gửi</button>
                    </div>
                </form>
            ) : (
                <div className="art-comment-form art-comment-login">
                    <p>Đăng nhập để viết bình luận của bạn.</p>
                    <button type="button" onClick={openLogin}>Đăng nhập</button>
                </div>
            )}

            {sent && (
                <p className="art-comment-ok" role="status">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <circle cx="12" cy="12" r="11" fill="currentColor" />
                        <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Gửi bình luận thành công
                </p>
            )}

            <ul className="art-comment-list">
                {comments.map((c) => (
                    <li key={c.id}>
                        <span className="art-comment-avatar" aria-hidden="true">
                            {(c.author.trim().charAt(0) || '?').toUpperCase()}
                        </span>
                        <div className="art-comment-body">
                            <div className="art-comment-head">
                                <strong>{c.author}</strong>
                                <time dateTime={new Date(c.createdAt).toISOString()}>
                                    {timeAgo(new Date(c.createdAt).toISOString())}
                                </time>
                            </div>
                            <p>{c.content}</p>
                            {user?.id === c.userId && (
                                <button
                                    type="button"
                                    className="link"
                                    onClick={() => {
                                        if (window.confirm('Xóa bình luận này?')) remove(c.id);
                                    }}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}