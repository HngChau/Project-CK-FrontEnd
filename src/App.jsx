import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SavedPage from './pages/SavedPage.jsx';
import MyFeedPage from './pages/MyFeedPage.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chuyen-muc/:slug" element={<CategoryPage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/bai-viet/:id" element={<ArticlePage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          {/* Chức năng mới 1 (TV2): đọc sau + bộ sưu tập */}
          <Route path="/da-luu" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
          {/* Chức năng mới 2 (TV3): theo dõi từ khóa + bản tin của tôi */}
          <Route path="/ban-tin-cua-toi" element={<ProtectedRoute><MyFeedPage /></ProtectedRoute>} />
          <Route path="*" element={<p>Không tìm thấy trang.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
