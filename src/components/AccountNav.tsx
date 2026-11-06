import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Icon({ children }: { children: ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {children}
        </svg>
    );
}

const NAV_ITEMS = [
    {
        to: '/tai-khoan', label: 'Thông tin tài khoản',
        icon: (<Icon><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6.5 7-6.5 1.2 0 2.3.2 3.3.7" /><path d="M14.5 20.5l.5-2.5 5-5a1.4 1.4 0 012 2l-5 5-2.5.5z" /></Icon>),
    },
    {
        to: '/hoat-dong-binh-luan', label: 'Hoạt động bình luận',
        icon: (<Icon><rect x="3" y="4" width="18" height="14" rx="3" /><path d="M7 9h10M7 13h6M9 18v3l4-3" /></Icon>),
    },
    {
        to: '/ban-tin-cua-toi', label: 'Bảng tin của bạn',
        icon: (<Icon><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 7l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" /></Icon>),
    },
    {
        to: '/tin-da-xem', label: 'Tin đã xem',
        icon: (<Icon><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7 9h2M12 9h5M7 14h10" /></Icon>),
    },
    {
        to: '/da-luu', label: 'Tin đã lưu',
        icon: (<Icon><path d="M6 3h12v18l-6-4.5L6 21z" /></Icon>),
    },
];

export default function AccountNav() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/', { replace: true });
        logout();
    };

    return (
        <aside className="acc-nav" aria-label="Tài khoản">
            {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} end className="acc-nav-link">
                    {item.icon}
                    <span>{item.label}</span>
                </NavLink>
            ))}
            <hr className="acc-nav-divider" />
            <button type="button" className="acc-nav-link" onClick={handleLogout}>
                <Icon>
                    <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" />
                    <path d="M15 8l4 4-4 4M19 12H9" />
                </Icon>
                <span>Đăng xuất</span>
            </button>
        </aside>
    );
}