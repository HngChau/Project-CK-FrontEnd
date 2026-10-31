import React, { useEffect, useState } from 'react';
import { getFeed } from '../services/rss';
import { CATEGORIES } from '../config/categories';

interface Article {
  id: string;
  title: string;
  summary: string;
  image: string;
  link?: string;
  pubDate: string;
}

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
        const fetchedSections = await Promise.all(
          targetCats.map(async (cat) => {
            const articles = await getFeed(cat.slug).catch(() => []);
            return {
              name: cat.name,
              slug: cat.slug,
              articles: articles.slice(0, 6),
            };
          })
        );
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'Arial, sans-serif', background: '#f8fafc' }}>
      
      {featuredArticles && (
        <section style={{ marginBottom: '40px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: '1.6fr 1fr' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img 
              src={featuredArticles.image || 'https://picsum.photos/800/450'} 
              alt={featuredArticles.title} 
              style={{ width: '100%', height: '100%', minHeight: '400px', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#ffffff' }}>
            <span style={{ background: '#dc2626', color: '#fff', padding: '6px 12px', fontSize: '11px', borderRadius: '6px', fontWeight: '800', width: 'fit-content', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Tiêu Điểm Nổi Bật
            </span>
            <h1 style={{ fontSize: '26px', margin: '0 0 16px 0', color: '#0f172a', lineHeight: '1.35', fontWeight: '700' }}>
              {featuredArticles.title}
            </h1>
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: '0 0 24px 0' }}>
              {featuredArticles.summary}
            </p>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
              {featuredArticles.pubDate ? new Date(featuredArticles.pubDate).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
            </span>
          </div>
        </section>
      )}  

      {section.map((sec, index) => (
        <section key={sec.slug} style={{ marginBottom: '45px', background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}> 
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dc2626', paddingBottom: '10px', marginBottom: '24px' }}>
            <h3 style={{ color: '#dc2626', fontSize: '20px', margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>
              {sec.name}
            </h3>
            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>Xem tất cả &rarr;</span>
          </div>

          {index === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
              {sec.articles[0] && (
                <div style={{ gridRow: 'span 2', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <img src={sec.articles[0].image || 'https://picsum.photos/600/400'} alt={sec.articles[0].title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#1e293b', lineHeight: '1.4', fontWeight: '700' }}>{sec.articles[0].title}</h4>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{sec.articles[0].summary}</p>
                  </div>
                </div>
              )}
              {sec.articles.slice(1, 5).map((article) => (
                <div key={article.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <img src={article.image || 'https://picsum.photos/200/150'} alt={article.title} style={{ width: '90px', height: '75px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1e293b', lineHeight: '1.35', fontWeight: '600' }}>{article.title}</h5>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mới cập nhật</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {sec.articles.map((article) => (
                <div key={article.id} style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                  <img src={article.image || 'https://picsum.photos/400/250'} alt={article.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1e293b', lineHeight: '1.4', fontWeight: '600' }}>{article.title}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>{article.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}