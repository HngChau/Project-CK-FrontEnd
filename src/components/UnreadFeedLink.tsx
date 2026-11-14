import { NavLink } from 'react-router-dom';
import { useUnreadFeed } from '../hooks/useUnreadFeed';
import { formatBadge } from '../services/readState';
import '../css/UnreadFeedLink.css';

export default function UnreadFeedLink() {
    const { unreadCount } = useUnreadFeed();
    const badge = formatBadge(unreadCount);
    const label = badge ? `Bản tin của tôi, ${unreadCount} tin chưa đọc` : 'Bản tin của tôi';

    return (
        <NavLink
            to="/ban-tin-cua-toi"
            className={({ isActive }) => `feed-link${isActive ? ' is-active' : ''}`}
            aria-label={label}
            title={label}>
            <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true">
                <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {badge && (
                <span className="feed-link-badge" aria-hidden="true">
          {badge}
        </span>
            )}
        </NavLink>
    );
}