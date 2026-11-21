import type { Category } from '../types';

export interface SubCategory {
  slug: string;
  name: string;
}

export type CategoryHoverMap = Record<string, SubCategory[]>;

// Kiểm tra lại danh sách RSS thật tại https://dantri.com.vn/rss.htm rồi chỉnh slug/rss cho đúng.
export const CATEGORIES: Category[] = [
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

// Danh sách chuyên mục con khi hover vào từng mục trong CATEGORIES
export const CATEGORY_HOVER_ITEMS: CategoryHoverMap = {
  'xa-hoi': [
    { slug: 'chinh-tri', name: 'Chính trị' },
    { slug: 'moi-truong', name: 'Môi trường' },
    { slug: 'giao-thong', name: 'Giao thông' },
    { slug: 'do-thi', name: 'Đô thị' },
  ],
  'the-gioi': [
    { slug: 'quan-su', name: 'Quân sự' },
    { slug: 'phan-tich-binh-luan', name: 'Phân tích - Bình luận' },
    { slug: 'the-gioi-do-day', name: 'Thế giới đó đây' },
    { slug: 'kieu-bao', name: 'Kiều bào' },
  ],
  'kinh-doanh': [
    { slug: 'tai-chinh', name: 'Tài chính' },
    { slug: 'chung-khoan', name: 'Chứng khoán' },
    { slug: 'doanh-nghiep', name: 'Doanh nghiệp' },
    { slug: 'khoi-nghiep', name: 'Khởi nghiệp' },
  ],
  'giao-duc': [
    { slug: 'goc-phu-huynh', name: 'Góc phụ huynh' },
    { slug: 'khuyen-hoc', name: 'Khuyến học' },
    { slug: 'guong-sang', name: 'Gương sáng' },
    { slug: 'du-hoc', name: 'Du học' },
  ],
  'the-thao': [
    { slug: 'bong-da-trong-nuoc', name: 'Bóng đá trong nước' },
    { slug: 'bong-da-chau-au', name: 'Bóng đá châu Âu' },
    { slug: 'tennis', name: 'Tennis' },
    { slug: 'golf', name: 'Golf' },
  ],
  'giai-tri': [
    { slug: 'hau-truong', name: 'Hậu trường' },
    { slug: 'dien-anh', name: 'Điện ảnh' },
    { slug: 'am-nhac', name: 'Âm nhạc' },
    { slug: 'sach-hay', name: 'Sách hay' },
  ],
  'suc-khoe': [
    { slug: 'ung-thu', name: 'Ung thư' },
    { slug: 'song-khoe', name: 'Sống khỏe' },
    { slug: 'kien-thuc-gioi-tinh', name: 'Kiến thức giới tính' },
  ],
  'phap-luat': [
    { slug: 'ho-so-vu-an', name: 'Hồ sơ vụ án' },
    { slug: 'phap-dinh', name: 'Pháp đình' },
  ],
};

// Các chuyên mục mở rộng khi bấm nút xổ "•••" (không làm phình thanh 1200px)
export const EXTRA_DRAWER_CATEGORIES: {
  slug: string;
  name: string;
  subs: SubCategory[];
}[] = [
  {
    slug: 'bat-dong-san',
    name: 'Bất động sản',
    subs: [
      { slug: 'du-an', name: 'Dự án' },
      { slug: 'thi-truong', name: 'Thị trường' },
      { slug: 'nha-dat', name: 'Nhà đất' },
    ],
  },
  {
    slug: 'doi-song',
    name: 'Đời sống',
    subs: [
      { slug: 'cong-dong', name: 'Cộng đồng' },
      { slug: 'nha-dep', name: 'Nhà đẹp' },
      { slug: 'gioi-tre', name: 'Giới trẻ' },
    ],
  },
  {
    slug: 'du-lich',
    name: 'Du lịch',
    subs: [
      { slug: 'kham-pha', name: 'Khám phá' },
      { slug: 'mon-ngon-diem-dep', name: 'Món ngon - Điểm đẹp' },
    ],
  },
  {
    slug: 'cong-nghe',
    name: 'Công nghệ',
    subs: [
      { slug: 'ai-internet', name: 'AI & Internet' },
      { slug: 'an-ninh-mang', name: 'An ninh mạng' },
    ],
  },
  {
    slug: 'o-to-xe-may',
    name: 'Xe ++',
    subs: [
      { slug: 'thi-truong-xe', name: 'Thị trường xe' },
      { slug: 'chon-xe', name: 'Chọn xe' },
      { slug: 'xe-dien', name: 'Xe điện' },
    ],
  },
  {
    slug: 'nhan-ai',
    name: 'Nhân ái',
    subs: [
      { slug: 'hoan-canh', name: 'Hoàn cảnh' },
      { slug: 'nhip-cau-nhan-ai', name: 'Nhịp cầu nhân ái' },
    ],
  },
];

export const getCategory = (slug: string): Category | undefined => {
  const direct = CATEGORIES.find((c) => c.slug === slug);
  if (direct) return direct;

  for (const [parentSlug, subs] of Object.entries(CATEGORY_HOVER_ITEMS)) {
    const foundSub = subs.find((s) => s.slug === slug);
    if (foundSub) {
      const parent = CATEGORIES.find((c) => c.slug === parentSlug);
      return {
        slug: foundSub.slug,
        name: foundSub.name,
        rss: parent?.rss ?? 'https://dantri.com.vn/rss/home.rss',
      };
    }
  }

  return undefined;
};

// export const getCategory = (slug: string): Category | undefined =>
//   CATEGORIES.find((c) => c.slug === slug);
