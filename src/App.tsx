import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ArticlePage from './pages/ArticlePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedPage from './pages/SavedPage';
import MyFeedPage from './pages/MyFeedPage';
import AuthDialog from './components/AuthDialog';
import type { AuthLocationState } from './components/AuthDialog';
import AccountPage from './pages/AccountPage';
import ViewedPage from './pages/ViewedPage';

export default function App() {
    const location = useLocation();
    const state = location.state as AuthLocationState | null;
    const isAuthPath = location.pathname === '/dang-nhap' || location.pathname === '/dang-ky';

    const mainLocation =
        state?.backgroundLocation ??
        (isAuthPath ? { ...location, pathname: '/', search: '', hash: '' } : location);

    return (
    <>
      <Header />
      <main className="container">
          <Routes location={mainLocation}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chuyen-muc/:slug" element={<CategoryPage />} />
          <Route path="/tim-kiem" element={<SearchPage />} />
          <Route path="/bai-viet/:id" element={<ArticlePage />} />
          <Route path="/:categorySlug/:articleSlug" element={<ArticlePage />} />
          {/* Chức năng mới 1 (TV2): đọc sau + bộ sưu tập */}
          <Route path="/da-luu" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
          {/* Chức năng mới 2 (TV3): theo dõi từ khóa + bản tin của tôi */}
          <Route path="/ban-tin-cua-toi" element={<ProtectedRoute><MyFeedPage /></ProtectedRoute>} />
          <Route path="*" element={<p>Không tìm thấy trang.</p>} />
          <Route path="/tai-khoan" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/hoat-dong-binh-luan" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/tin-da-xem" element={<ProtectedRoute><ViewedPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />

        {/* Popup đăng nhập / đăng ký */}
        {isAuthPath && (
            <Routes>
                <Route path="/dang-nhap" element={<AuthDialog><LoginPage /></AuthDialog>} />
                <Route path="/dang-ky" element={<AuthDialog><RegisterPage /></AuthDialog>} />
            </Routes>
        )}
    </>
  );
}
