import { useEffect } from 'react';
import { getArticle, getFeed } from '../services/rss';
import { formatFullDate } from '../services/format';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { getCategory } from '../config/categories';
import { useAsync } from '../hooks/useAsync';
import DOMPurify from 'dompurify';

import CommentSection from '../components/article/CommentSection';
import ArticleTags from '../components/article/ArticleTags';
import { extractTags } from '../services/tags';
import ArticleToolbar from '../components/article/ArticleToolbar';
import ListenPlayer from '../components/article/ListenPlayer';
import ArticleSidebar from '../components/article/ArticleSidebar';
import RelatedArticles from '../components/article/RelatedArticles';
import { useAuth } from '../context/AuthContext';
import { recordView } from '../services/viewed';
import { useReadState } from '../hooks/useReadState';
import '../css/ArticlePage.css';

export default function ArticlePage() {
    // Lấy ID từ đường dẫn
    const params = useParams();
    const [searchParams] = useSearchParams();

    const id =
        params.id ||
        params.articleSlug?.match(/-(\d+)\.htm$/)?.[1] ||
        '';

    // Lấy chuyên mục từ ?c=the-gioi
    const slug =
        searchParams.get('c') ||
        params.categorySlug ||
        '';

    console.log('Article ID:', id);
    console.log('Category:', slug);

    // Lấy dữ liệu bài viết
    const {
        data: article,
        loading,
        error
    } = useAsync(
        () => id
            ? getArticle(id, slug)
            : Promise.resolve(null),
        [id, slug]
    );

    // Feed cùng chuyên mục dùng cho cột phải và "Tin liên quan".
    // Chuyên mục lạ (không có trong categories.ts) thì dùng feed trang chủ.
    const feedSlug = getCategory(slug) ? slug : 'trang-chu';
    const feed = useAsync(() => getFeed(feedSlug), [feedSlug]);

    // Ghi nhận bài đã xem cho người dùng đang đăng nhập (hiện ở trang "Tin đã xem")
    const { user } = useAuth();
    const { pathname, search } = useLocation();

    useEffect(() => {
        if (!user || !article) return;
        const cat = getCategory(article.category);
        recordView(user.email, {
            id: article.id,
            title: article.title,
            to: pathname + search,
            image: article.image || undefined,
            category: cat && cat.slug !== 'trang-chu' ? cat.name : undefined,
            article: { ...article, content: '' },
        });
        // Chỉ ghi lại khi đổi người dùng hoặc đổi bài, không ghi lại mỗi lần render
    }, [user?.email, article?.id]);

    const { markRead } = useReadState();
    const articleId = article?.id;

    useEffect(() => {
        if (!articleId) return;
        markRead(articleId);
    }, [articleId, markRead]);

    if (loading) {
        return <div className="status">Đang tải bài viết...</div>;
    }

    if (loading) {
        return <div className="status">Đang tải bài viết...</div>;
    }

    if (error || !article) {
        return (
            <div className="status error">
                <h2>Không tìm thấy bài viết</h2>
                <p>
                    Bài viết có thể đã bị xóa hoặc không còn
                    trong nguồn dữ liệu RSS.
                </p>
                <Link to="/">Quay lại trang chủ</Link>
            </div>
        );
    }

    // 3. Xácdđịnh chuyên mục
    const category = getCategory(article.category);

    // Không hiển thị Trang chủ như một chuyên mục bài viết.
    const categoryName =
        category && category.slug !== 'trang-chu' ? category.name : '';

    // 4. Làm sạch HTML bằng DOMPURIFY
    const sanitizedContent = DOMPurify.sanitize(article.content || '', {
        USE_PROFILES: { html: true },
    });

    const contentDocument = new DOMParser().parseFromString(sanitizedContent, 'text/html');

    // 5. Loại bỏ ảnh đại diện bi trùng
    if (article.image) {
        try {
            const coverUrl = new URL(article.image, window.location.href).href;
            contentDocument.querySelectorAll('img').forEach((img) => {
                const src = img.getAttribute('src');
                if (!src) return;
                try {
                    if (new URL(src, window.location.href).href === coverUrl) {
                        img.remove();
                    }
                } catch {
                    // Bỏ qua URL ảnh không hợp lệ
                }
            });
        } catch {
            // Bỏ qua nếu URL ảnh đại diện không hợp lệ
        }
    }

    const cleanContent = contentDocument.body.innerHTML;

    // 6. DỮ LIỆU PHỤ: ĐOẠN MỞ ĐẦU, VĂN BẢN CHO NGHE BÀI, TIN KHÁC
    // Bài báo Dân trí mở đầu bằng "(Dân trí) - ", thêm vào nếu RSS chưa có.
    const lead = /^\(?\s*dân trí\s*\)?/i.test(article.summary)
        ? article.summary
        : `(Dân trí) - ${article.summary}`;

    // Văn bản để trình duyệt đọc thành tiếng.
    const plainText = [article.title, article.summary, contentDocument.body.textContent ?? '']
        .join('. ')
        .replace(/\s+/g, ' ')
        .trim();

    // Tin khác cùng chuyên mục (bỏ bài đang đọc).
    // RSS không có lượt xem nên cột phải lấy tin mới nhất của chuyên mục.
    const others = (feed.data ?? []).filter((a) => a.id !== article.id);
    const featured = others[0];
    const popular = others.slice(1, 6);
    const related = others.slice(6, 10);
    // Tags gợi ý từ nội dung bài (RSS không có tag)
    const tags = extractTags(plainText);

    // 7. GIAO DIỆN
    return (
        <div className="art-page">
            {/* Thanh công cụ nổi bên trái: chia sẻ, lưu, in */}
            <ArticleToolbar article={article} />

            <article className="art-main">
                {/* Breadcrumb bên trái, ngày giờ bên phải */}
                <div className="art-topline">
                    <nav className="art-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        {categoryName && (
                            <>
                                <span className="art-breadcrumb-sep" aria-hidden="true">›</span>
                                <Link to={`/chuyen-muc/${category?.slug}`}>{categoryName}</Link>
                            </>
                        )}
                    </nav>
                    <time className="art-date" dateTime={article.pubDate}>
                        {formatFullDate(article.pubDate)}
                    </time>
                </div>

                <h1 className="art-title">{article.title}</h1>

                {/* Nguồn bài và trình nghe bài viết */}
                <div className="art-byline">
                    <div className="art-source-chip">
                        <span className="art-source-logo" aria-hidden="true">DT</span>
                        <span>Dân trí</span>
                    </div>
                    <ListenPlayer text={plainText} />
                </div>

                {article.summary && <p className="art-lead">{lead}</p>}

                {article.image && (
                    <figure className="art-cover">
                        <img src={article.image} alt={article.title} />
                        <figcaption>{article.title}</figcaption>
                    </figure>
                )}

                <div className="art-content">
                    {cleanContent.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
                    ) : (
                        <p className="art-empty">
                            RSS hiện không cung cấp nội dung chi tiết.
                            Bạn có thể đọc bài viết đầy đủ tại trang Dân trí.
                        </p>
                    )}
                </div>

                <div className="art-source">
                    <span>Nguồn:</span>
                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                        Báo Dân trí
                    </a>
                </div>
                <CommentSection articleId={article.id} articleTitle={article.title} />
                <ArticleTags tags={tags} />
                <RelatedArticles items={related} />
            </article>
            <ArticleSidebar featured={featured} items={popular} categoryName={categoryName} />
        </div>
    );
}