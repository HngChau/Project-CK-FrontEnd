import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';

const MENU_ITEMS = [
    { label: 'Thông tin tài khoản', to: '/tai-khoan' },
    { label: 'Hoạt động bình luận', to: '/hoat-dong-binh-luan' },
    { label: 'Bảng tin của bạn', to: '/ban-tin-cua-toi' },
    { label: 'Tin đã xem', to: '/tin-da-xem' },
    { label: 'Tin đã lưu', to: '/da-luu' },
];

// lấy tên hiển thị ở menu
export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts[parts.length - 1] ?? '';
}

interface Props {
    user: User;
    onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onMouseDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    return (
        <div className="user-menu" ref={ref}>
            <button
                type="button"
                className="user-menu-toggle"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className="user-avatar" aria-hidden="true">{getInitials(user.name)}</span>
                <span className="user-greeting">
          Chào, <strong>{getFirstName(user.name)}</strong>
        </span>
                <svg
                    className={`user-chevron${open ? ' is-open' : ''}`}
                    viewBox="0 0 24 24" width="20" height="20" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <ul className="user-dropdown" role="menu">
                    {MENU_ITEMS.map((item) => (
                        <li key={item.to} role="none">
                            <Link to={item.to} role="menuitem" onClick={() => setOpen(false)}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li role="none">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                        >
                            Đăng xuất
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
}