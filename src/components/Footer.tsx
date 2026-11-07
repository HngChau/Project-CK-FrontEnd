
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../config/categories';

export default function Footer() {
  const safeCategories = Array.isArray(CATEGORIES) ? CATEGORIES : [];

  return (
    <footer className="site-footer">
      <div className="footer-main">

        {/* Giới thiệu */}
        <div className="footer-intro">
          <Link to="/" className="footer-logo">
            dân trí
          </Link>

          <p>
            Báo điện tử Dân Trí – Cập nhật tin tức nhanh chóng,
            chính xác và đa chiều về đời sống, xã hội, kinh tế,
            giáo dục và thế giới.
          </p>
        </div>

        {/* Chuyên mục */}
        <div>
          <h3 className="footer-heading">Chuyên mục</h3>

          <ul className="footer-list">
            {safeCategories
              .filter(c => c?.slug !== 'trang-chu')
              .slice(0, 6)
              .map(c => (
                <li key={c.slug}>
                  <Link to={`/chuyen-muc/${c.slug}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {/* Liên kết */}
        <div>
          <h3 className="footer-heading">Liên kết</h3>

          <ul className="footer-list">
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/tim-kiem">Tìm kiếm</Link></li>
            <li><Link to="/dang-nhap">Đăng nhập</Link></li>
            <li><Link to="/dang-ky">Đăng ký</Link></li>
            <li><Link to="/da-luu">Tin đã lưu</Link></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 className="footer-heading">Thông tin liên hệ</h3>

          <div className="footer-contact">
            <p><strong>Website:</strong> Báo điện tử Dân Trí</p>
            <p><strong>Email:</strong> contact@dantri.vn</p>
            <p><strong>Địa chỉ:</strong> Việt Nam</p>
            <p>
              Theo dõi và cập nhật những tin tức mới nhất mỗi ngày.
            </p>
          </div>
        </div>

      </div>

      {/* Bản quyền */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} DÂN TRÍ. All rights reserved.
          </p>

          <p>
            Thông tin nhanh chóng – Chính xác – Tin cậy
          </p>
        </div>
      </div>
    </footer>
  );
}
