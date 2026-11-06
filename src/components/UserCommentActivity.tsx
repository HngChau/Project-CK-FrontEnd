import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteComment, getUserComments } from '../hooks/useComments';
import type { UserComment } from '../hooks/useComments';
import { timeAgo } from '../services/rss';

export default function UserCommentActivity() {
    const { user } = useAuth();
    const [items, setItems] = useState<UserComment[]>([]);

    const reload = useCallback(() => {
        setItems(user ? getUserComments(user.id) : []);
    }, [user]);

    useEffect(() => {
        reload();
    }, [reload]);

    if (!user) return null;

    if (items.length === 0) {
        return (
            <p className="ua-empty">
                Bạn chưa có bình luận nào. Hãy đọc một bài viết và để lại bình luận đầu tiên.
            </p>
        );
    }

    return (
        <div className="ua-wrap">
            <p className="ua-count">{items.length} bình luận</p>
            <ul className="ua-list">
                {items.map((c) => {
                    const iso = new Date(c.createdAt).toISOString();
                    return (
                        <li key={`${c.articleId}-${c.id}`}>
                            <Link className="ua-article" to={c.articlePath ?? `/bai-viet/${c.articleId}`}>
                                {c.articleTitle ?? 'Bài viết đã bình luận'}
                            </Link>
                            <p className="ua-content">{c.content}</p>
                            <div className="ua-meta">
                                <time dateTime={iso}>{timeAgo(iso)}</time>
                                <button
                                    type="button"
                                    className="link"
                                    onClick={() => {
                                        if (window.confirm('Xóa bình luận này?')) {
                                            deleteComment(c.articleId, c.id);
                                            reload();
                                        }
                                    }}
                                >
                                    Xóa
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}