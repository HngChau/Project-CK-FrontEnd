import { useState } from 'react';
import type { FormEvent } from 'react';
import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom';
// import { CATEGORIES } from '../config/categories';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from './WeatherWidget';
import type { AuthLocationState } from './AuthDialog';
import UserMenu from "./UserMenu";
import NotificationBell from './NotificationBell';
import { useTheme } from '../context/ThemeContext';

import { MoreHorizontal, X } from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_HOVER_ITEMS,
  EXTRA_DRAWER_CATEGORIES,
} from '../config/categories';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [drawerOpen, setDrawerOpen] = useState(false);//bật tắt hover chuyên mục

    const [q, setQ] = useState('');
    const navigate = useNavigate();
    const location = useLocation();


  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (q.trim()) {
      setDrawerOpen(false);
      navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
      <header className="header">
        <div className="container header-top">
          <Link to="/" className="logo" onClick={() => setDrawerOpen(false)}>dân trí</Link>
          <WeatherWidget />
          <form onSubmit={submit} className="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm tin tức" aria-label="Tìm kiếm" />
            <button type="submit">Tìm</button>
          </form>
          <div className="account">
              {/* Nút chuyển đổi giao diện sáng/tối */}
              <button
                  type="button"
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={
                      theme === 'light'
                          ? 'Chuyển sang chế độ tối'
                          : 'Chuyển sang chế độ sáng'
                  }
                  title="Chuyển đổi giao diện">
                  {theme === 'light' ? '☽' : '☼'}
              </button>
            {user ? (
                <>
                  <NotificationBell />
                  <UserMenu user={user} onLogout={logout} />
                </>
            ) : (
                <Link
                    to="/dang-nhap"
                    state={{ backgroundLocation: location, from: location.pathname + location.search } satisfies AuthLocationState}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                  </svg>
                  Đăng nhập
                </Link>
            )}
          </div>
        </div>
        {/* <nav className="container nav" aria-label="Chuyên mục">
          {CATEGORIES.map((c) => (
              <NavLink key={c.slug} to={c.slug === 'trang-chu' ? '/' : `/chuyen-muc/${c.slug}`} end>
                {c.name}
              </NavLink>
          ))}
        </nav> */}
      <div className="catbar-wrap" onMouseLeave={() => setDrawerOpen(false)}>
        <div className="catbar-inner">
          <nav className="catbar-nav" aria-label="Chuyên mục">
            {CATEGORIES.map((c) => {
              const subs = CATEGORY_HOVER_ITEMS[c.slug] ?? [];
              const hasHover = subs.length > 0;
              const to = c.slug === 'trang-chu' ? '/' : `/chuyen-muc/${c.slug}`;

              return (
                <div
                  key={c.slug}
                  className={`catbar-item ${hasHover ? 'has-hover' : ''}`}
                >
                  <NavLink
                    to={to}
                    end
                    className={({ isActive }) =>
                      `catbar-link ${isActive ? 'is-active' : ''}`
                    }
                    onClick={() => setDrawerOpen(false)}
                  >
                    {c.name}
                  </NavLink>

                  {/*Menu chuyên mục con */}
                  {hasHover && (
                    <div className="catbar-dropdown" role="menu">
                      {subs.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/chuyen-muc/${sub.slug}`}
                          className="catbar-sublink"
                          role="menuitem"
                          onClick={() => setDrawerOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Nút ... */}
          <button
            type="button"
            className="catbar-toggle-btn"
            aria-label="Mở rộng danh sách chuyên mục"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            {drawerOpen ? <X size={17} /> : <MoreHorizontal size={17} />}
          </button>
        </div>

        {/*Bảng xổ chuyên mục */}
        {drawerOpen && (
          <div className="catbar-drawer">
            <div className="catbar-drawer-inner">
              {EXTRA_DRAWER_CATEGORIES.map((extra) => (
                <div key={extra.slug}>
                  <Link
                    to={`/chuyen-muc/${extra.slug}`}
                    className="catbar-drawer-title"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {extra.name}
                  </Link>
                  <ul className="catbar-drawer-list">
                    {extra.subs.map((s) => (
                      <li key={s.slug}>
                        <Link
                          to={`/chuyen-muc/${s.slug}`}
                          onClick={() => setDrawerOpen(false)}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </header>
  );
}