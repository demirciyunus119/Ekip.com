import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ROUTES } from './constants';

// Components
import { Navbar } from './components/Navbar'; // Changed to named import
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedMemberRoute from './components/ProtectedMemberRoute';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberLoginPage from './pages/MemberLoginPage';
import MemberDashboard from './pages/MemberDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
            <Route path={ROUTES.MEMBER_LOGIN} element={<MemberLoginPage />} />

            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path={ROUTES.MEMBER_DASHBOARD}
              element={
                <ProtectedMemberRoute>
                  <MemberDashboard />
                </ProtectedMemberRoute>
              }
            />
          </Routes>
        </main>
        {/* Copyright metni ve arka planı footer'a geri eklendi, üst boşluk (mt-8) kaldırıldı */}
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>© 2026 Ekip Bursa. Tüm Hakları Saklıdır.</p>
        </footer>
      </Router>
    </AuthProvider>
  );
};

export default App;