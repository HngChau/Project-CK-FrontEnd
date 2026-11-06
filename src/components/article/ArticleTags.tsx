import { Link } from 'react-router-dom';

interface Props {
    tags: string[];
}

export default function ArticleTags({ tags }: Props) {
    if (tags.length === 0) return null;
    return (
        <nav className="art-tags" aria-label="Tags">
            <span className="art-tags-label">Tags:</span>
            {tags.map((tag) => (
                <Link key={tag} to={`/tim-kiem?q=${encodeURIComponent(tag)}`}>
                    {tag}
                </Link>
            ))}
        </nav>
    );
}