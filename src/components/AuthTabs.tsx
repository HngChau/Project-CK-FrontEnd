import { NavLink, useLocation } from 'react-router-dom';

export default function AuthTabs() {
    const { state } = useLocation();
    const className = ({ isActive }: { isActive: boolean }) =>
        isActive ? 'auth-tab is-active' : 'auth-tab';

    return (
        <nav className="auth-tabs" aria-label="Đăng nhập hoặc đăng ký">
            <NavLink to="/dang-nhap" state={state} replace className={className}>
                Đăng nhập
            </NavLink>
            <NavLink to="/dang-ky" state={state} replace className={className}>
                Đăng ký
            </NavLink>
        </nav>
    );
}