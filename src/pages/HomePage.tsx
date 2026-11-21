import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, RotateCcw } from 'lucide-react';
import { getFeed, timeAgo } from '../services/rss';
import { articlePath } from '../services/format';
import { CATEGORIES } from '../config/categories';
// import ArticleSkeleton from '../components/ArticleSkeleton';
import type { Article } from '../types';

interface CategorySection {
  name: string;
  slug: string;
  articles: Article[];
}

function extractTopicLabel(title: string): string {
  return title
    .replace(/[“”"'?!:()[\]]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(' ');
}

function HomePageSkeleton() {
  return (
    <div className="hp-wrap" aria-busy="true" aria-label="Đang tải trang chủ">
      {/* 1. HERO 3 CỘT */}
      <section className="hp-hero">
        <div className="hp-hero-left">
          {[0, 1].map((idx) => (
            <div key={`skel-hero-l-${idx}`} style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div className="hp-skel-box hp-hero-sub-img" />
              <div className="hp-skel-box hp-skel-line" />
              <div className="hp-skel-box hp-skel-line short" />
            </div>
          ))}
        </div>

        <div className="hp-hero-center">
          <div className="hp-skel-box hp-hero-lead-img" />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div className="hp-skel-box" style={{ width: '72px', height: '20px' }} />
            <div className="hp-skel-box hp-skel-line sm" style={{ marginBottom: 0, alignSelf: 'center' }} />
          </div>
          <div className="hp-skel-box hp-skel-line lg" />
          <div className="hp-skel-box hp-skel-line" />
          <div className="hp-skel-box hp-skel-line short" />
        </div>

        <aside>
          <div className="hp-skel-box hp-skel-line" style={{ width: '110px', height: '18px', marginBottom: '14px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={`skel-latest-${idx}`} className="hp-skel-news-row">
                <div className="hp-skel-box hp-skel-num" />
                <div style={{ flex: 1 }}>
                  <div className="hp-skel-box hp-skel-line" style={{ marginBottom: '6px' }} />
                  <div className="hp-skel-box hp-skel-line sm" style={{ marginBottom: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* 2. THÂN TRANG 2 CỘT */}
      <div className="hp-body">
        <div className="hp-left-stream">
          {[0, 1, 2, 3].map((idx) => (
            <div key={`skel-stream-${idx}`} className="hp-stream-card">
              <div style={{ flexShrink: 0 }}>
                <div className="hp-skel-box hp-stream-img" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hp-skel-box hp-skel-line" />
                <div className="hp-skel-box hp-skel-line" style={{ height: '12px' }} />
                <div className="hp-skel-box hp-skel-line short" style={{ height: '12px', marginBottom: 0 }} />
              </div>
            </div>
          ))}

          <div className="hp-skel-topics">
            {[0, 1, 2, 3].map((idx) => (
              <div key={`skel-topic-${idx}`} className="hp-skel-box hp-skel-pill" />
            ))}
          </div>
        </div>

        <div className="hp-right-sections">
          {[0, 1].map((secIdx) => (
            <section
              key={`skel-sec-${secIdx}`}
              style={{
                paddingBottom: secIdx === 0 ? '24px' : 0,
                borderBottom: secIdx === 0 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div className="hp-skel-box hp-skel-line" style={{ width: '150px', height: '18px', marginBottom: '14px' }} />
              <div className="hp-sec-split">
                <div className="hp-sec-lead">
                  <div className="hp-skel-box hp-sec-lead-img" />
                  <div className="hp-skel-box hp-skel-line" />
                  <div className="hp-skel-box hp-skel-line" style={{ height: '12px' }} />
                  <div className="hp-skel-box hp-skel-line short" style={{ height: '12px', marginBottom: 0 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[0, 1, 2].map((itemIdx) => (
                    <div key={`skel-sub-${secIdx}-${itemIdx}`} className="hp-skel-sub-item">
                      <div style={{ flex: 1 }}>
                        <div className="hp-skel-box hp-skel-line" style={{ height: '12px', marginBottom: '6px' }} />
                        <div className="hp-skel-box hp-skel-line short" style={{ height: '12px', marginBottom: 0 }} />
                      </div>
                      <div className="hp-skel-box hp-sec-thumb" style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* 3. HÀNG 4 CHUYÊN MỤC ĐÁY TRANG */}
      <section className="hp-bottom-4">
        {[0, 1, 2, 3].map((colIdx) => (
          <div key={`skel-b4-${colIdx}`} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="hp-skel-box hp-skel-line" style={{ width: '110px', height: '16px', marginBottom: '12px' }} />
            <div className="hp-skel-box hp-bottom-lead-img" />
            <div className="hp-skel-box hp-skel-line" />
            <div className="hp-skel-box hp-skel-line short" />
          </div>
        ))}
      </section>
    </div>
  );
}

export default function HomePage() {
  const [heroArticles, setHeroArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  const triggerRetry = useCallback(() => {
    setReloadTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      setSections([]);

      try {
        const homeArticles = await getFeed('trang-chu');
        if (!isMounted) return;

        if (!homeArticles || homeArticles.length === 0) {
          setError('Không thể tải dữ liệu RSS trang chủ. Vui lòng thử lại.');
          setLoading(false);
          return;
        }

        setHeroArticles(homeArticles.slice(0, 8));
        setLoading(false);

        const targetCats = CATEGORIES.filter((c) => c.slug !== 'trang-chu');
        for (const cat of targetCats) {
          if (!isMounted) break;
          const articles = await getFeed(cat.slug).catch((err) => {
            console.error(`Lỗi tải chuyên mục ${cat.slug}:`, err);
            return [];
          });

          if (articles.length > 0 && isMounted) {
            setSections((prev) => {
              if (prev.some((s) => s.slug === cat.slug)) return prev;
              return [
                ...prev,
                {
                  name: cat.name,
                  slug: cat.slug,
                  articles: articles.slice(0, 8),
                },
              ];
            });
          }
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
        if (isMounted) {
          setError('Đã xảy ra lỗi khi kết nối nguồn dữ liệu RSS.');
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [reloadTick]);

  const latestSidebar = useMemo(() => {
    const fromHero = heroArticles.slice(3, 8);
    if (fromHero.length >= 5) return fromHero;

    const existingIds = new Set(heroArticles.map((a) => a.id));
    const extra: Article[] = [];
    for (const sec of sections) {
      for (const art of sec.articles) {
        if (!existingIds.has(art.id)) {
          existingIds.add(art.id);
          extra.push(art);
          if (fromHero.length + extra.length >= 5) return [...fromHero, ...extra];
        }
      }
    }
    return [...fromHero, ...extra];
  }, [heroArticles, sections]);

  const leftStreamArticles = useMemo(() => {
    const usedIds = new Set(heroArticles.map((a) => a.id));
    const pool: Article[] = [];
    for (const sec of sections) {
      const candidates = sec.articles.length > 5 ? sec.articles.slice(4) : sec.articles.slice(1, 4);
      for (const art of candidates) {
        if (!usedIds.has(art.id)) {
          usedIds.add(art.id);
          pool.push(art);
        }
      }
    }
    return pool.slice(0, 18);
  }, [sections, heroArticles]);

  const hotTopics = useMemo(() => {
    const source = sections.length > 0 ? sections.flatMap((s) => s.articles) : heroArticles;
    return Array.from(
      new Map(
        source
          .filter((a) => a.title)
          .map((a) => {
            const label = extractTopicLabel(a.title);
            return [label.toLowerCase(), label];
          })
      ).values()
    ).slice(0, 6);
  }, [sections, heroArticles]);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="hp-wrap" style={{ textAlign: 'center', padding: '56px 16px' }}>
        <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '14px' }}>{error}</p>
        <button
          type="button"
          onClick={triggerRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} />
          Thử lại
        </button>
      </div>
    );
  }

  const mainLead = heroArticles[0];
  const subLeads = heroArticles.slice(1, 3);
  const rightColumnSections = sections.slice(0, 6);
  const bottom4GridSections = sections.slice(4, 8);

  return (
    <div className="hp-wrap">
      {mainLead && (
        <section className="hp-hero">
          <div className="hp-hero-left">
            {subLeads.map((art) => (
              <article key={art.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <Link to={articlePath(art)}>
                  <img
                    src={art.image || 'https://picsum.photos/400/250'}
                    alt={art.title}
                    className="hp-hero-sub-img"
                  />
                </Link>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#0f172a', lineHeight: '1.4', fontWeight: 700 }}>
                  <Link to={articlePath(art)} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {art.title}
                  </Link>
                </h3>
              </article>
            ))}
          </div>

          <article className="hp-hero-center">
            <Link to={articlePath(mainLead)}>
              <img
                src={mainLead.image || 'https://picsum.photos/800/450'}
                alt={mainLead.title}
                className="hp-hero-lead-img"
              />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ background: '#16a34a', color: '#fff', padding: '3px 9px', fontSize: '11px', borderRadius: '3px', fontWeight: 700, textTransform: 'uppercase' }}>
                Tiêu điểm
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {mainLead.pubDate ? timeAgo(mainLead.pubDate) : 'Mới cập nhật'}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', margin: '0 0 10px 0', color: '#0f172a', lineHeight: '1.35', fontWeight: 700 }}>
              <Link to={articlePath(mainLead)} style={{ color: 'inherit', textDecoration: 'none' }}>
                {mainLead.title}
              </Link>
            </h1>
            <p
              style={{
                color: '#475569',
                lineHeight: '1.55',
                fontSize: '14px',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {mainLead.summary}
            </p>
          </article>

          <aside>
            <div style={{ borderBottom: '2px solid #16a34a', paddingBottom: '6px', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                Tin mới nhận
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {latestSidebar.map((art, idx) => (
                <div
                  key={art.id}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    paddingBottom: '10px',
                    borderBottom: idx < latestSidebar.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 800, color: idx < 3 ? '#16a34a' : '#94a3b8', minWidth: '18px' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: '#1e293b', lineHeight: '1.38', fontWeight: 600 }}>
                      <Link to={articlePath(art)} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {art.title}
                      </Link>
                    </h3>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {art.pubDate ? timeAgo(art.pubDate) : 'Mới cập nhật'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      <div className="hp-body">
        <div className="hp-left-stream">
          {leftStreamArticles.slice(0, 6).map((art) => (
            <article key={`stream-top-${art.id}`} className="hp-stream-card">
              <Link to={articlePath(art)} style={{ flexShrink: 0 }}>
                <img
                  src={art.image || 'https://picsum.photos/220/145'}
                  alt={art.title}
                  className="hp-stream-img"
                />
              </Link>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', lineHeight: '1.35', fontWeight: 700 }}>
                  <Link to={articlePath(art)} style={{ color: '#0f172a', textDecoration: 'none' }}>
                    {art.title}
                  </Link>
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: '1.45',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {art.summary}
                </p>
              </div>
            </article>
          ))}

          {hotTopics.length > 0 && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '16px',
                margin: '4px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ea580c', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>
                  <Flame size={15} strokeWidth={2.2} />
                  Chủ đề nóng
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {hotTopics.map((topic) => (
                  <Link
                    key={topic}
                    to={`/tim-kiem?q=${encodeURIComponent(topic)}`}
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      color: '#1e293b',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {leftStreamArticles.slice(6).map((art, idx, arr) => (
            <article
              key={`stream-bottom-${art.id}`}
              className="hp-stream-card"
              style={{
                paddingBottom: idx < arr.length - 1 ? '16px' : 0,
                borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <Link to={articlePath(art)} style={{ flexShrink: 0 }}>
                <img
                  src={art.image || 'https://picsum.photos/220/145'}
                  alt={art.title}
                  className="hp-stream-img"
                />
              </Link>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', lineHeight: '1.35', fontWeight: 700 }}>
                  <Link to={articlePath(art)} style={{ color: '#0f172a', textDecoration: 'none' }}>
                    {art.title}
                  </Link>
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: '1.45',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {art.summary}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="hp-right-sections">
          {rightColumnSections.map((sec, sIdx) => {
            const lead = sec.articles[0];
            const subList = sec.articles.slice(1, 5);

            return (
              <section
                key={`right-sec-${sec.slug}`}
                style={{
                  paddingBottom: sIdx < rightColumnSections.length - 1 ? '24px' : 0,
                  borderBottom: sIdx < rightColumnSections.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                    <Link to={`/chuyen-muc/${sec.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {sec.name}
                    </Link>
                  </h2>
                  <Link to={`/chuyen-muc/${sec.slug}`} style={{ fontSize: '12.5px', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
                    Xem thêm &raquo;
                  </Link>
                </div>

                <div className="hp-sec-split">
                  {lead && (
                    <article className="hp-sec-lead">
                      <Link to={articlePath(lead)}>
                        <img
                          src={lead.image || 'https://picsum.photos/450/280'}
                          alt={lead.title}
                          className="hp-sec-lead-img"
                        />
                      </Link>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', lineHeight: '1.35', fontWeight: 700 }}>
                        <Link to={articlePath(lead)} style={{ color: '#0f172a', textDecoration: 'none' }}>
                          {lead.title}
                        </Link>
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          color: '#475569',
                          lineHeight: '1.45',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {lead.summary}
                      </p>
                    </article>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {subList.map((art, idx) => (
                      <div
                        key={art.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '10px',
                          alignItems: 'flex-start',
                          paddingBottom: idx < subList.length - 1 ? '10px' : 0,
                          borderBottom: idx < subList.length - 1 ? '1px solid #f1f5f9' : 'none',
                        }}
                      >
                        <Link to={articlePath(art)} style={{ fontSize: '13.5px', lineHeight: '1.35', color: '#1e293b', textDecoration: 'none', fontWeight: 600 }}>
                          {art.title}
                        </Link>
                        {art.image && (
                          <Link to={articlePath(art)} style={{ flexShrink: 0 }}>
                            <img src={art.image} alt={art.title} className="hp-sec-thumb" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {bottom4GridSections.length > 0 && (
        <section className="hp-bottom-4">
          {bottom4GridSections.map((col) => {
            const lead = col.articles[0];
            const rest = col.articles.slice(1, 4);

            return (
              <div key={`bottom4-${col.slug}`} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '2px solid #16a34a', paddingBottom: '6px', marginBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                    <Link to={`/chuyen-muc/${col.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {col.name}
                    </Link>
                  </h2>
                </div>

                {lead && (
                  <article style={{ marginBottom: '12px' }}>
                    <Link to={articlePath(lead)}>
                      <img
                        src={lead.image || 'https://picsum.photos/400/250'}
                        alt={lead.title}
                        className="hp-bottom-lead-img"
                      />
                    </Link>
                    <h3 style={{ margin: 0, fontSize: '15px', lineHeight: '1.35', fontWeight: 700 }}>
                      <Link to={articlePath(lead)} style={{ color: '#0f172a', textDecoration: 'none' }}>
                        {lead.title}
                      </Link>
                    </h3>
                  </article>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                  {rest.map((art) => (
                    <div
                      key={art.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        alignItems: 'flex-start',
                        paddingTop: '10px',
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <Link to={articlePath(art)} style={{ fontSize: '13px', lineHeight: '1.35', color: '#1e293b', textDecoration: 'none', fontWeight: 500 }}>
                        {art.title}
                      </Link>
                      {art.image && (
                        <Link to={articlePath(art)} style={{ flexShrink: 0 }}>
                          <img src={art.image} alt={art.title} className="hp-bottom-thumb" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
