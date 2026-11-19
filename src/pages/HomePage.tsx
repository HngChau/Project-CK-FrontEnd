import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeed } from '../services/rss';
import { articlePath } from '../services/format';
import { CATEGORIES } from '../config/categories';
import type { Article } from '../types';
import '../css/HomePage.css';
interface CategorySection {
  name: string;
  slug: string;
  articles: Article[];
}

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] =
      useState<Article | null>(null);

  const [section, setSection] =
      useState<CategorySection[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const homeArticles = await getFeed('trang-chu').catch(() => []);
        if (homeArticles.length > 0) {
          setFeaturedArticles(homeArticles[0]);
        }

        const targetCats = CATEGORIES
            .filter((c) => c.slug !== 'trang-chu')
            .slice(0, 3);

        const fetchedSections: CategorySection[] = [];
        for (const cat of targetCats) {
          const articles = await getFeed(cat.slug).catch((error) => {
            console.error(`Lỗi tải chuyên mục ${cat.slug}:`, error);
            return [];
          });
          fetchedSections.push({
            name: cat.name,
            slug: cat.slug,
            articles: articles.slice(0, 5),
          });
        }
        setSection(fetchedSections);

      } catch (error) {
        console.error('Lỗi tải dữ liệu trang chủ:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
        <div className="home-loading">
          Đang tải trang chủ...
        </div>
    );
  }

  return (
      <div className="home-page">
        {featuredArticles && (
            <section className="home-featured">

              <div className="home-featured-image">
                <Link to={articlePath(featuredArticles)}>
                  <img
                      src={
                          featuredArticles.image ||
                          'https://picsum.photos/800/450'
                      }
                      alt={featuredArticles.title}
                  />
                </Link>
              </div>

              <div className="home-featured-info">

            <span className="home-featured-label">
              Tiêu điểm
            </span>

                <h1 className="home-featured-title">
                  <Link to={articlePath(featuredArticles)}>
                    {featuredArticles.title}
                  </Link>
                </h1>

                <p className="home-featured-summary">
                  {featuredArticles.summary}
                </p>

                <span className="home-featured-date">
              {featuredArticles.pubDate
                  ? new Date(
                      featuredArticles.pubDate
                  ).toLocaleDateString('vi-VN')
                  : 'Mới cập nhật'}
            </span>
              </div>
            </section>
        )}
        {section.map((sec) => (
            <section
                key={sec.slug}
                className="home-category"
            >

              <div className="home-category-header">

                <h3 className="home-category-title">
                  {sec.name}
                </h3>

                <Link
                    to={`/chuyen-muc/${sec.slug}`}
                    className="home-category-more"
                >
                  Xem thêm »
                </Link>
              </div>

              <div className="home-category-content">
                {sec.articles[0] && (
                    <div className="home-category-main">

                      <Link to={articlePath(sec.articles[0])}>
                        <img
                            src={
                                sec.articles[0].image ||
                                'https://picsum.photos/600/400'
                            }
                            alt={sec.articles[0].title}
                        />
                      </Link>

                      <h4>
                        <Link to={articlePath(sec.articles[0])}>
                          {sec.articles[0].title}
                        </Link>
                      </h4>

                      <p>
                        {sec.articles[0].summary}
                      </p>
                    </div>
                )}

                <div className="home-category-list">

                  {sec.articles.slice(1, 5).map((article) => (
                      <div
                          key={article.id}
                          className="home-category-item"
                      >

                        <Link
                            to={articlePath(article)}
                            className="home-category-item-image"
                        >
                          <img
                              src={
                                  article.image ||
                                  'https://picsum.photos/200/150'
                              }
                              alt={article.title}
                          />
                        </Link>

                        <div className="home-category-item-info">

                          <h5>
                            <Link to={articlePath(article)}>
                              {article.title}
                            </Link>
                          </h5>

                          <span>
                      Mới cập nhật
                    </span>

                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </section>
        ))}
      </div>
  );
}