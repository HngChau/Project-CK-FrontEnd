import { Link } from 'react-router-dom';
import { timeAgo } from '../services/rss';
import BookmarkButton from './BookmarkButton';
import type { Article } from '../types';

interface Props {
  article: Article;
  large?: boolean;
}

export default function ArticleCard({ article, large = false }: Props) {
  const to = `/bai-viet/${article.id}?c=${article.category}`;
  return (
    <article className={large ? 'card card-large' : 'card'}>
      {article.image && (
        <Link to={to}>
          <img src={article.image} alt="" loading="lazy" />
        </Link>
      )}
      <div className="card-body">
        <h3><Link to={to}>{article.title}</Link></h3>
        <p className="summary">{article.summary}</p>
        <div className="meta">
          <span>{timeAgo(article.pubDate)}</span>
          <BookmarkButton article={article} />
        </div>
      </div>
    </article>
  );
}
