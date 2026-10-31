import { useState } from 'react';
import type { FormEvent } from 'react';
import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom';
import { CATEGORIES } from '../config/categories';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from './WeatherWidget';
import type { AuthLocationState } from './AuthDialog';

export default function Header() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (q.trim()) navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="header">
      <div className="container header-top">
        <Link to="/" className="logo">dân trí</Link>
        <WeatherWidget />
        <form onSubmit={submit} className="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm tin tức" aria-label="Tìm kiếm" />
          <button type="submit">Tìm</button>
        </form>
        <div className="account">
          {user ? (
            <>
              <Link to="/da-luu">Đã lưu</Link>
              <Link to="/ban-tin-cua-toi">Bản tin của tôi</Link>
              <button className="link" onClick={logout}>Đăng xuất ({user.name})</button>
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
      <nav className="container nav" aria-label="Chuyên mục">
        {CATEGORIES.map((c) => (
          <NavLink key={c.slug} to={c.slug === 'trang-chu' ? '/' : `/chuyen-muc/${c.slug}`} end>
            {c.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
