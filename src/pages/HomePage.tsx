import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeed } from '../services/rss';
import { articlePath } from '../services/format';
import { CATEGORIES } from '../config/categories';
import type { Article } from '../types';

interface CategorySection {
  name: string;
  slug: string;
  articles: Article[];
}

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<Article | null>(null);
  const [section, setSection] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const homeArticles = await getFeed('trang-chu').catch(() => []);
        if (homeArticles.length > 0) {
          setFeaturedArticles(homeArticles[0]);
        }

        const targetCats = CATEGORIES.filter((c) => c.slug !== 'trang-chu').slice(0, 3);
        // const fetchedSections = await Promise.all(
        //     targetCats.map(async (cat) => {
        //       const articles = await getFeed(cat.slug).catch(() => []);
        //       return {
        //         name: cat.name,
        //         slug: cat.slug,
        //         articles: articles.slice(0, 5),
        //       };
        //     })
        // );
        // setSection(fetchedSections);
        
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
    return <div style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: '#666' }}>Đang tải trang chủ...</div>;
  }

  return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', background: '#f5f5f5' }}>

        {featuredArticles && (
            <section style={{ marginBottom: '35px', background: '#fff', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e5e5e5', display: 'grid', gridTemplateColumns: '1.8fr 1fr' }}>
              <div style={{ position: 'relative' }}>
                <Link to={articlePath(featuredArticles)} style={{ display: 'block', height: '100%' }}>
                  <img
                      src={featuredArticles.image || 'https://picsum.photos/800/450'}
                      alt={featuredArticles.title}
                      style={{ width: '100%', height: '100%', minHeight: '380px', objectFit: 'cover', display: 'block' }}
                  />
                </Link>
              </div>
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ffffff' }}>
            <span style={{ background: '#d70018', color: '#fff', padding: '4px 10px', fontSize: '11px', borderRadius: '2px', fontWeight: 'bold', width: 'fit-content', textTransform: 'uppercase', marginBottom: '12px' }}>
              Tiêu điểm
            </span>
                <h1 style={{ fontSize: '24px', margin: '0 0 12px 0', color: '#222', lineHeight: '1.35', fontWeight: 'bold' }}>
                  <Link to={articlePath(featuredArticles)}>{featuredArticles.title}</Link>
                </h1>
                <p style={{ color: '#555', lineHeight: '1.5', fontSize: '14px', margin: '0 0 20px 0' }}>
                  {featuredArticles.summary}
                </p>
                <span style={{ fontSize: '12px', color: '#888' }}>
              {featuredArticles.pubDate ? new Date(featuredArticles.pubDate).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
            </span>
              </div>
            </section>
        )}

        {section.map((sec) => (
            <section key={sec.slug} style={{ marginBottom: '35px', background: '#fff', padding: '20px 24px', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d70018', paddingBottom: '8px', marginBottom: '20px' }}>
                <h3 style={{ color: '#d70018', fontSize: '18px', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {sec.name}
                </h3>
                <Link to={`/chuyen-muc/${sec.slug}`} style={{ fontSize: '13px', color: '#0066cc', fontWeight: '600' }}>
                  Xem thêm &raquo;
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
                {sec.articles[0] && (
                    <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #eee', paddingRight: '24px' }}>
                      <Link to={articlePath(sec.articles[0])}>
                        <img
                            src={sec.articles[0].image || 'https://picsum.photos/600/400'}
                            alt={sec.articles[0].title}
                            style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px', display: 'block' }}
                        />
                      </Link>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111', lineHeight: '1.35', fontWeight: 'bold' }}>
                        <Link to={articlePath(sec.articles[0])}>{sec.articles[0].title}</Link>
                      </h4>
                      <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: '1.5' }}>
                        {sec.articles[0].summary}
                      </p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'flex-start' }}>
                  {sec.articles.slice(1, 5).map((article) => (
                      <div key={article.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        <Link to={articlePath(article)} style={{ flexShrink: 0 }}>
                          <img
                              src={article.image || 'https://picsum.photos/200/150'}
                              alt={article.title}
                              style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '3px', display: 'block' }}
                          />
                        </Link>
                        <div>
                          <h5 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#222', lineHeight: '1.35', fontWeight: '600' }}>
                            <Link to={articlePath(article)}>{article.title}</Link>
                          </h5>
                          <span style={{ fontSize: '11px', color: '#999' }}>Mới cập nhật</span>
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