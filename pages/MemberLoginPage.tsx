import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

const MemberLoginPage: React.FC = () => {
  const [tcId, setTcId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { loginMember } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!/^\d{11}$/.test(tcId)) {
        setError('TC Kimlik Numarası 11 haneli ve sadece rakamlardan oluşmalıdır.');
        setIsLoading(false);
        return;
    }

    const success = await loginMember(tcId);
    if (success) {
      navigate(ROUTES.MEMBER_DASHBOARD);
    } else {
      setError('Üye bulunamadı veya TC Kimlik Numarası yanlış.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md min-h-[90vh] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Üye Girişi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tcId" className="block text-gray-700 font-semibold mb-2">TC Kimlik Numarası</label>
            <input
              type="text"
              id="tcId"
              value={tcId}
              onChange={(e) => setTcId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 transition duration-200"
              required
              maxLength={11}
              pattern="\d{11}"
              title="TC Kimlik Numarası 11 haneli bir sayı olmalıdır"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
};

export default MemberLoginPage;