import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import AuthTabs from './AuthTabs';
import '../pages/auth.css';

export interface AuthLocationState {
    backgroundLocation?: Location;
    from?: string;
}

export default function AuthDialog({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const cardRef = useRef<HTMLDivElement>(null);
    const hasBackground = Boolean((location.state as AuthLocationState | null)?.backgroundLocation);

    const close = useCallback(() => {
        if (hasBackground) navigate(-1);
        else navigate('/', { replace: true });
    }, [hasBackground, navigate]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        cardRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [close]);

    return createPortal(
        <div
            className="auth-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div
                className="auth-card"
                role="dialog"
                aria-modal="true"
                aria-label="Đăng nhập hoặc đăng ký"
                tabIndex={-1}
                ref={cardRef}
            >
                <button type="button" className="auth-close" onClick={close} aria-label="Đóng">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M5 5l14 14M19 5L5 19" />
                    </svg>
                </button>
                <AuthTabs />
                {children}
            </div>
        </div>,
        document.body
    );
}