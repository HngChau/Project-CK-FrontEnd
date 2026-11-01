import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getArticle, timeAgo } from '../services/rss';
import { getCategory } from '../config/categories';
import { useAsync } from '../hooks/useAsync';
import BookmarkButton from '../components/BookmarkButton';

export default function ArticlePage() {
    const { id = '' } = useParams<{ id: string }>();
    const [params] = useSearchParams();
    const slug = params.get('c');
    const {
        data: article,
        loading,
        error,
    } = useAsync(
        () => getArticle(id, slug), [id, slug]);

    // Trạng thái đang tải
    if (loading) {
        return (
            <div className="status">
                Đang tải bài viết...
            </div>
        );
    }

    // Không tìm thấy bài viết
    if (error || !article) {
        return (
            <div className="status error">
                <h2>Không tìm thấy bài viết</h2>
                <p>
                    Bài viết có thể đã bị xóa hoặc không còn
                    trong nguồn dữ liệu RSS.
                </p>
                <Link to="/">
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    const category = getCategory(article.category);

    return (
        <article className="article">

            {/* Đường dẫn chuyên mục */}
            <div className="article-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span> / </span>
                {category && (
                    <Link to={`/chuyen-muc/${category.slug}`}>
                        {category.name}
                    </Link>
                )}
            </div>

            {/* Tiêu đề bài viết */}
            <h1 className="article-title">
                {article.title}
            </h1>
            {/* Thông tin bài viết */}
            <div className="article-meta">

        <span>
          {category?.name || 'Tin tức'}
        </span>
                <span>
          {timeAgo(article.pubDate)}
        </span>
                <BookmarkButton article={article} />
            </div>

            {/* Ảnh đại diện */}
            {article.image && (
                <figure className="article-cover">
                    <img src={article.image} alt={article.title}/>
                </figure>
            )}

            {/* Tóm tắt bài viết */}
            {article.summary && (
                <p className="article-lead">
                    {article.summary}
                </p>
            )}

            {/* Nội dung bài viết */}
            <div className="article-content">
                <p>
                    Nội dung bài viết sẽ được hiển thị
                    sau khi xử lý HTML từ RSS.
                </p>
            </div>

            {/* Link bài viết gốc */}
            <div className="article-source">
                <a href={article.link}
                   target="_blank"
                   rel="noopener noreferrer">
                    Đọc toàn bộ bài viết trên Dân trí →
                </a>
            </div>
        </article>
    );
}