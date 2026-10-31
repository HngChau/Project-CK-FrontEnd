import { Link } from 'react-router-dom';
import { articlePath, formatFullDate } from '../../services/format';
import type { Article } from '../../types';

interface Props {
    items: Article[];
}

export default function RelatedArticles({ items }: Props) {
    if (items.length === 0) return null;
    return (
        <section className="art-related" aria-label="Tin liên quan">
            <h2>Tin liên quan</h2>
            <div className="art-related-grid">
                {items.map((a) => (
                    <article key={a.id}>
                        {a.image && (
                            <Link to={articlePath(a)}>
                                <img src={a.image} alt="" loading="lazy" />
                            </Link>
                        )}
                        <h3><Link to={articlePath(a)}>{a.title}</Link></h3>
                        <time>{formatFullDate(a.pubDate)}</time>
                    </article>
                ))}
            </div>
        </section>
    );
}