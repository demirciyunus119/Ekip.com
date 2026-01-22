import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const HomePage: React.FC = () => {
  return (
    <div className="flex-grow flex justify-center p-4"> {/* Dış div'deki p-8, p-4 olarak değiştirildi. items-center zaten kaldırılmıştı. */}
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-2xl w-full min-h-[90vh] flex flex-col justify-center"> {/* min-h-[90vh] olarak güncellendi ve içeriği dikey ortalamak için flex özellikleri eklendi */}
        <h1 className="text-4xl font-extrabold text-blue-700 mb-6">
          EKİP BURSA'YA HOŞ GELDİNİZ!
        </h1>
        {/* Açıklama paragrafı kaldırıldı */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to={ROUTES.REGISTER}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
          >
            Hemen Üye Ol
          </Link>
          <Link
            to={ROUTES.MEMBER_LOGIN}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
          >
            Üye Girişi Yap
          </Link>
          <Link
            to={ROUTES.ADMIN_LOGIN}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
          >
            Yönetici Paneli
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;