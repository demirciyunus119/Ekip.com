import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memberService } from '../services/memberService';
import { Member, MemberFormValues } from '../types';
import Modal from '../components/Modal'; // Import Modal
import { ROUTES } from '../constants';

const MemberDashboard: React.FC = () => {
  const { memberId, logoutMember } = useAuth();
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState<Member | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // State for member edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormValues, setEditFormValues] = useState<MemberFormValues>({ name: '', surname: '', phoneNumber: '', tcId: '' }); // Added name
  const [editFormMessage, setEditFormMessage] = useState<string | null>(null);
  const [isUpdatingMember, setIsUpdatingMember] = useState<boolean>(false);

  const fetchMemberInfo = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    if (memberId) {
      try {
        const { data: member, error } = await memberService.getMemberById(memberId);
        if (error && error.code !== 'PGRST116') {
          setMessage(`Üye bilgileri çekilirken hata oluştu: ${error.message}`);
          setMessageType('error');
          setMemberInfo(null);
        } else if (member) {
          setMemberInfo(member);
        } else {
          setMessage('Üye bilgileri bulunamadı.');
          setMessageType('error');
          setMemberInfo(null);
        }
      } catch (err: any) {
        setMessage(`Beklenmedik bir hata oluştu: ${err.message}`);
        setMessageType('error');
        setMemberInfo(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      navigate(ROUTES.MEMBER_LOGIN);
    }
  }, [memberId, navigate]);

  useEffect(() => {
    fetchMemberInfo();
  }, [fetchMemberInfo]);

  const handleDeleteAccount = async () => {
    if (memberId && window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsDeleting(true);
      setMessage(null);
      try {
        const { success, error } = await memberService.deleteMember(memberId);
        if (error) {
          setMessage(`Hesabınız silinirken bir hata oluştu: ${error.message}`);
          setMessageType('error');
        } else if (success) {
          setMessage('Hesabınız başarıyla silindi.');
          setMessageType('success');
          logoutMember();
          setTimeout(() => {
            navigate(ROUTES.HOME);
          }, 2000);
        }
      } catch (err: any) {
        setMessage(`Beklenmedik bir hata oluştu: ${err.message}`);
        setMessageType('error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleLogout = () => {
    logoutMember();
    navigate(ROUTES.MEMBER_LOGIN);
  };

  // Member edit functionality
  const handleEditInfo = () => {
    if (memberInfo) {
      setEditFormValues({
        name: memberInfo.name, // Added name
        surname: memberInfo.surname,
        phoneNumber: memberInfo.phoneNumber,
        tcId: memberInfo.tcId,
      });
      setEditFormMessage(null);
      setIsEditModalOpen(true);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormValues(prev => ({ ...prev, [name]: value }));
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    return /^\d{10,15}$/.test(phoneNumber);
  };

  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!memberInfo) return;

    setEditFormMessage(null);
    setIsUpdatingMember(true);

    if (!editFormValues.name || !editFormValues.surname || !editFormValues.phoneNumber) { // Added name validation
      setEditFormMessage('Lütfen tüm alanları doldurunuz.');
      setIsUpdatingMember(false);
      return;
    }
    if (!validatePhoneNumber(editFormValues.phoneNumber)) {
      setEditFormMessage('Telefon Numarası sadece rakamlardan oluşmalı ve geçerli bir formatta olmalıdır.');
      setIsUpdatingMember(false);
      return;
    }

    const updatedMember: Member = {
      ...memberInfo,
      name: editFormValues.name, // Include name
      surname: editFormValues.surname,
      phoneNumber: editFormValues.phoneNumber,
    };

    try {
      const { data, error } = await memberService.updateMember(updatedMember);
      if (error) {
        setEditFormMessage(`Bilgiler güncellenirken bir hata oluştu: ${error.message}`);
      } else if (data) {
        setEditFormMessage('Bilgileriniz başarıyla güncellendi.');
        fetchMemberInfo(); // Re-fetch member info after update
        setTimeout(() => setIsEditModalOpen(false), 1500);
      }
    } catch (err: any) {
      setEditFormMessage(`Beklenmedik bir hata oluştu: ${err.message}`);
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Bilinmiyor';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <p className="text-xl text-gray-700">Üye bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-700 mb-6">Hata!</h2>
          <p className="text-xl text-gray-700">{message || "Üye bilgileri bulunamadı veya bir sorun oluştu."}</p>
          <button
            onClick={handleLogout}
            className="mt-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center min-h-[90vh] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-green-700 mb-6">Hesabım</h2>

        <div className="space-y-4 mb-6 text-left">
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Ad:</span> {memberInfo.name}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Soyad:</span> {memberInfo.surname}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Telefon Numarası:</span> {memberInfo.phoneNumber}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">TC Kimlik Numarası:</span> {memberInfo.tcId}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Kayıt Tarihi:</span> {formatDate(memberInfo.createdAt)}
          </p>
        </div>

        {message && (
          <p className={`mt-4 mb-4 text-center font-medium ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleEditInfo}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            disabled={isDeleting}
          >
            Bilgileri Düzenle
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? 'Siliniyor...' : 'Hesabı Sil'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            disabled={isDeleting}
          >
            Çıkış Yap
          </button>
        </div>

        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Bilgilerinizi Düzenle">
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-gray-700 font-semibold mb-2">Ad</label>
              <input
                type="text"
                id="editName"
                name="name"
                value={editFormValues.name}
                onChange={handleEditFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isUpdatingMember}
              />
            </div>
            <div>
              <label htmlFor="editSurname" className="block text-gray-700 font-semibold mb-2">Soyad</label>
              <input
                type="text"
                id="editSurname"
                name="surname"
                value={editFormValues.surname}
                onChange={handleEditFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isUpdatingMember}
              />
            </div>
            <div>
              <label htmlFor="editPhoneNumber" className="block text-gray-700 font-semibold mb-2">Telefon Numarası</label>
              <input
                type="tel"
                id="editPhoneNumber"
                name="phoneNumber"
                value={editFormValues.phoneNumber}
                onChange={handleEditFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                pattern="\d{10,15}"
                title="Telefon numarası sadece rakamlardan oluşmalı (10-15 hane)"
                disabled={isUpdatingMember}
              />
            </div>
            <div>
              <label htmlFor="editTcId" className="block text-gray-700 font-semibold mb-2">TC Kimlik Numarası</label>
              <input
                type="text"
                id="editTcId"
                name="tcId"
                value={editFormValues.tcId}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                disabled // TC ID is not editable
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdatingMember}
            >
              {isUpdatingMember ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
          {editFormMessage && (
            <p className="mt-4 text-center text-red-600 font-medium">{editFormMessage}</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MemberDashboard;