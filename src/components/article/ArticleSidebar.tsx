import { Link } from 'react-router-dom';
import { articlePath } from '../../services/format';
import type { Article } from '../../types';

interface Props {
    // Tin nổi bật lớn ở đầu cột phải.
    featured?: Article;
    // Danh sách đánh số 1, 2, 3...
    items: Article[];
    // Tên chuyên mục (để trống nếu là trang chủ)
    categoryName: string;
}

export default function ArticleSidebar({ featured, items, categoryName }: Props) {
    if (!featured && items.length === 0) return null;

    return (
        <aside className="art-sidebar" aria-label="Tin khác">
            {featured && (
                <article className="art-side-featured">
                    {featured.image && (
                        <Link to={articlePath(featured)}>
                            <img src={featured.image} alt="" loading="lazy" />
                        </Link>
                    )}
                    <h3><Link to={articlePath(featured)}>{featured.title}</Link></h3>
                    {featured.summary && <p>{featured.summary}</p>}
                </article>
            )}

            {items.length > 0 && (
                <section className="art-side-list">
                    <h2>{categoryName ? `Nổi bật trong ${categoryName}` : 'Tin mới nhất'}</h2>
                    <ol>
                        {items.map((a, i) => (
                            <li key={a.id}>
                                <span className="art-side-num">{i + 1}.</span>
                                <Link className="art-side-title" to={articlePath(a)}>{a.title}</Link>
                                {a.image && (
                                    <Link className="art-side-thumb" to={articlePath(a)} tabIndex={-1} aria-hidden="true">
                                        <img src={a.image} alt="" loading="lazy" />
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </aside>
    );
}