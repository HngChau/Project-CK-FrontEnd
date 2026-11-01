import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../hooks/useBookmarks';
import type { Article } from '../../types';

interface Props {
    article: Article;
}

const iconProps = {
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

export default function ArticleToolbar({ article }: Props) {
    const { user } = useAuth();
    const { isSaved, toggle } = useBookmarks();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const saved = isSaved(article.id);

    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);

    const share = async () => {
        const url = window.location.href;
        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title: article.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch {
            // người dùng đóng hộp thoại chia sẻ hoặc trình duyệt chặn clipboard
        }
    };

    const bookmark = () => (user ? toggle(article) : navigate('/dang-nhap'));

    return (
        <aside className="art-toolbar" aria-label="Công cụ bài viết">
            <button type="button" onClick={share} aria-label="Chia sẻ" title="Chia sẻ">
                <svg {...iconProps}>
                    <path d="M15 4l6 6-6 6" />
                    <path d="M21 10H9a6 6 0 0 0-6 6v3" />
                </svg>
                {copied && <span className="art-toolbar-tip" role="status">Đã sao chép liên kết</span>}
            </button>
            <button
                type="button"
                onClick={bookmark}
                aria-label={saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết để đọc sau'}
                aria-pressed={saved}
                title={saved ? 'Bỏ lưu' : 'Đọc sau'}
                className={saved ? 'is-active' : ''}
            >
                <svg {...iconProps} fill={saved ? 'currentColor' : 'none'}>
                    <path d="M6 3h12v18l-6-4-6 4z" />
                </svg>
            </button>
            <button type="button" onClick={() => window.print()} aria-label="In bài viết" title="In bài viết">
                <svg {...iconProps}>
                    <path d="M7 8V3h10v5" />
                    <rect x="3" y="8" width="18" height="9" rx="2" />
                    <path d="M7 14h10v7H7z" />
                </svg>
            </button>
        </aside>
    );
}