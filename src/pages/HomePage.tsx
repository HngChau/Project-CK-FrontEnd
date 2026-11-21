import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { getFeed, timeAgo } from '../services/rss';
import { articlePath } from '../services/format';
import { CATEGORIES } from '../config/categories';
import ArticleSkeleton from '../components/ArticleSkeleton';
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

export default function HomePage() {
  const [heroArticles, setHeroArticles] = useState<Article[]>([]);
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const homeArticles = await getFeed('trang-chu').catch(() => []);
        if (!isMounted) return;
        setHeroArticles(homeArticles.slice(0, 8));
        setLoading(false);

        const targetCats = CATEGORIES.filter((c) => c.slug !== 'trang-chu');
        for (const cat of targetCats) {
          if (!isMounted) break;
          const articles = await getFeed(cat.slug).catch((error) => {
            console.error(`Lỗi tải chuyên mục ${cat.slug}:`, error);
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
      } catch (error) {
        console.error('Lỗi tải dữ liệu trang chủ:', error);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cột "Tin mới nhận" bên phải Hero
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

  // Gom toàn bộ bài viết từ các chuyên mục để đổ vào luồng tin liên tục bên cột trái
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

  // Gom các từ khóa cho khung "CHỦ ĐỀ NÓNG"
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
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '110px 16px 20px'}}>
        <ArticleSkeleton count={9} />
      </div>
    );
  }

  const mainLead = heroArticles[0];
  const subLeads = heroArticles.slice(1, 3);

  const rightColumnSections = sections.slice(0, 6);
  const bottom4GridSections = sections.slice(4, 8);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 40px',color: '#1e293b', background: '#fff' }}>
      
      {/* =====================================================================
          PHẦN 1: CỤM TIÊU ĐIỂM ĐẦU TRANG (HERO 3 CỘT)
         ===================================================================== */}
      {mainLead && (
        <section
          style={{
            marginBottom: '28px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: '1fr 1.85fr 1.05fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Cột trái Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid #e2e8f0', paddingRight: '16px' }}>
            {subLeads.map((art) => (
              <article key={art.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <Link to={articlePath(art)}>
                  <img
                    src={art.image || 'https://picsum.photos/400/250'}
                    alt={art.title}
                    style={{ width: '100%', height: '135px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px', display: 'block' }}
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

          {/* Cột giữa Hero */}
          <article style={{ borderRight: '1px solid #e2e8f0', paddingRight: '20px' }}>
            <Link to={articlePath(mainLead)}>
              <img
                src={mainLead.image || 'https://picsum.photos/800/450'}
                alt={mainLead.title}
                style={{ width: '100%', height: '310px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px', display: 'block' }}
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

          {/* Cột phải Hero: Tin mới nhận */}
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

      {/* =====================================================================
          PHẦN 2: THÂN TRANG CHIA HẲN 2 CỘT LỚN CHẠY DÀI SONG SONG (CHUẨN DÂN TRÍ)
         ===================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          gap: '28px',
          alignItems: 'start',
          paddingBottom: '32px',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '28px',
        }}
      >
        {/* -------------------- CỘT TRÁI: DÒNG CHẢY TIN DỌC + CHỦ ĐỀ NÓNG -------------------- */}
        <div style={{ borderRight: '1px solid #e5e7eb', paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {leftStreamArticles.slice(0, 6).map((art) => (
            <article
              key={`stream-top-${art.id}`}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                paddingBottom: '16px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Link to={articlePath(art)} style={{ flexShrink: 0 }}>
                <img
                  src={art.image || 'https://picsum.photos/220/145'}
                  alt={art.title}
                  style={{ width: '145px', height: '96px', objectFit: 'cover', borderRadius: '4px', display: 'block' }}
                />
              </Link>
              <div>
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

          {/* KHỐI XEN KẼ GIỮA CỘT TRÁI: CHỦ ĐỀ NÓNG */}
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
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                paddingBottom: idx < arr.length - 1 ? '16px' : 0,
                borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <Link to={articlePath(art)} style={{ flexShrink: 0 }}>
                <img
                  src={art.image || 'https://picsum.photos/220/145'}
                  alt={art.title}
                  style={{ width: '145px', height: '96px', objectFit: 'cover', borderRadius: '4px', display: 'block' }}
                />
              </Link>
              <div>
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

        {/* -------------------- CỘT PHẢI: TẤT CẢ CHUYÊN MỤC XẾP DỌC NỐI TIẾP -------------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '18px', alignItems: 'start' }}>
                  {lead && (
                    <article style={{ borderRight: '1px solid #f1f5f9', paddingRight: '14px' }}>
                      <Link to={articlePath(lead)}>
                        <img
                          src={lead.image || 'https://picsum.photos/450/280'}
                          alt={lead.title}
                          style={{ width: '100%', height: '165px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px', display: 'block' }}
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
                            <img
                              src={art.image}
                              alt={art.title}
                              style={{ width: '82px', height: '56px', objectFit: 'cover', borderRadius: '3px', display: 'block' }}
                            />
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

      {/* =====================================================================
          PHẦN 3: HÀNG 4 CHUYÊN MỤC NGANG HÀNG Ở ĐÁY TRANG
         ===================================================================== */}
      {bottom4GridSections.length > 0 && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '20px',
          }}
        >
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
                        style={{ width: '100%', height: '135px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px', display: 'block' }}
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
                          <img
                            src={art.image}
                            alt={art.title}
                            style={{ width: '68px', height: '48px', objectFit: 'cover', borderRadius: '3px', display: 'block' }}
                          />
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