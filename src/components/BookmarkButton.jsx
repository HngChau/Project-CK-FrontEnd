import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';

export default function BookmarkButton({ article }) {
  const { user } = useAuth();
  const { isSaved, toggle } = useBookmarks();
  const navigate = useNavigate();
  const saved = isSaved(article.id);

  const onClick = () => (user ? toggle(article) : navigate('/dang-nhap'));
  return (
    <button className="link" onClick={onClick} aria-pressed={saved}>
      {saved ? 'Bỏ lưu' : 'Đọc sau'}
    </button>
  );
}
