import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

// Changed to named export to resolve import error in App.tsx
export const Navbar: React.FC = () => {
  const { isAdmin, memberId, logoutAdmin, logoutMember } = useAuth();

  const handleLogout = () => {
    if (isAdmin) {
      logoutAdmin();
    }
    if (memberId) {
      logoutMember();
    }
  };

  // Base64 logo dizgesini kaldırıp, doğrudan inline SVG kullanıyoruz.
  // Navbar'ın arka plan rengiyle uyumlu mavi (#1e40af) ve beyaz metin.
  return (
    <nav className="bg-blue-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={ROUTES.HOME} className="flex items-center space-x-2" aria-label="Ana Sayfa">
          <svg className="h-16 w-auto" width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="120" height="40" rx="5" ry="5" fill="#1e40af"/>
            <text x="60" y="25" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">Ekip.com</text>
          </svg>
        </Link>
        <div className="flex items-center space-x-4">
          {!isAdmin && !memberId && (
            <>
              <Link to={ROUTES.REGISTER} className="text-white hover:text-blue-200 transition duration-300">Üye Ol</Link>
              <Link to={ROUTES.MEMBER_LOGIN} className="text-white hover:text-blue-200 transition duration-300">Üye Girişi</Link>
              <Link to={ROUTES.ADMIN_LOGIN} className="text-white hover:text-blue-200 transition duration-300">Yönetici Girişi</Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to={ROUTES.ADMIN_DASHBOARD} className="text-white hover:text-blue-200 transition duration-300 font-semibold">Yönetici Paneli</Link>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded transition duration-300">Çıkış Yap</button>
            </>
          )}

          {memberId && (
            <>
              <Link to={ROUTES.MEMBER_DASHBOARD} className="text-white hover:text-blue-200 transition duration-300 font-semibold">Hesabım</Link>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded transition duration-300">Çıkış Yap</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};