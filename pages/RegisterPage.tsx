import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../services/memberService'; // Import the new service
import { Member, MemberFormValues } from '../types';
import { ROUTES } from '../constants';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<MemberFormValues>({
    name: '', // New field
    surname: '',
    phoneNumber: '',
    tcId: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateTcId = (tcId: string): boolean => {
    return /^\d{11}$/.test(tcId);
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    return /^\d{10,15}$/.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    setIsLoading(true);

    if (!formData.name || !formData.surname || !formData.phoneNumber || !formData.tcId) { // Added name validation
      setMessage('Lütfen tüm alanları doldurunuz.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (!validateTcId(formData.tcId)) {
      setMessage('TC Kimlik Numarası 11 haneli ve sadece rakamlardan oluşmalıdır.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setMessage('Telefon Numarası sadece rakamlardan oluşmalı ve geçerli bir formatta olmalıdır.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const newMember: Member = {
      id: formData.tcId, // Supabase PK 'id' will map to tcId
      name: formData.name, // Include name
      surname: formData.surname,
      phoneNumber: formData.phoneNumber,
      tcId: formData.tcId,
    };

    try {
      const { data, error } = await memberService.addMember(newMember);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation code for PostgreSQL
          setMessage('Bu TC Kimlik Numarası zaten kayıtlı.');
        } else {
          setMessage(`Üyelik kaydı sırasında bir hata oluştu: ${error.message}`);
        }
        setMessageType('error');
      } else if (data) {
        setMessage('Üyelik kaydınız başarıyla oluşturuldu!');
        setMessageType('success');
        setFormData({ name: '', surname: '', phoneNumber: '', tcId: '' }); // Clear form including name
        setTimeout(() => {
          navigate(ROUTES.MEMBER_LOGIN);
        }, 2000);
      }
    } catch (err: any) {
      setMessage(`Beklenmedik bir hata oluştu: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md min-h-[90vh] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Yeni Üyelik Oluştur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Ad</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="surname" className="block text-gray-700 font-semibold mb-2">Soyad</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 font-semibold mb-2">Telefon Numarası</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
              pattern="\d{10,15}"
              title="Telefon numarası sadece rakamlardan oluşmalı (10-15 hane)"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="tcId" className="block text-gray-700 font-semibold mb-2">TC Kimlik Numarası</label>
            <input
              type="text"
              id="tcId"
              name="tcId"
              value={formData.tcId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
              maxLength={11}
              pattern="\d{11}"
              title="TC Kimlik Numarası 11 haneli bir sayı olmalıdır"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center font-medium ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;