// Kiểm tra lại danh sách RSS thật tại https://dantri.com.vn/rss.htm rồi chỉnh slug/rss cho đúng.
export const CATEGORIES = [
  { slug: 'trang-chu', name: 'Trang chủ', rss: 'https://dantri.com.vn/rss/home.rss' },
  { slug: 'xa-hoi', name: 'Xã hội', rss: 'https://dantri.com.vn/rss/xa-hoi.rss' },
  { slug: 'the-gioi', name: 'Thế giới', rss: 'https://dantri.com.vn/rss/the-gioi.rss' },
  { slug: 'kinh-doanh', name: 'Kinh doanh', rss: 'https://dantri.com.vn/rss/kinh-doanh.rss' },
  { slug: 'giao-duc', name: 'Giáo dục', rss: 'https://dantri.com.vn/rss/giao-duc.rss' },
  { slug: 'the-thao', name: 'Thể thao', rss: 'https://dantri.com.vn/rss/the-thao.rss' },
  { slug: 'giai-tri', name: 'Giải trí', rss: 'https://dantri.com.vn/rss/giai-tri.rss' },
  { slug: 'suc-khoe', name: 'Sức khỏe', rss: 'https://dantri.com.vn/rss/suc-khoe.rss' },
  { slug: 'phap-luat', name: 'Pháp luật', rss: 'https://dantri.com.vn/rss/phap-luat.rss' },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);
