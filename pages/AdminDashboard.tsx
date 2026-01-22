import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { localStorageService } from '../services/localStorageService';
import { memberService } from '../services/memberService';
import { Member, MemberFormValues } from '../types';
import Modal from '../components/Modal';
import { ROUTES } from '../constants';

const AdminDashboard: React.FC = () => {
  const { logoutAdmin, changeAdminPassword } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [adminPasswordMessage, setAdminPasswordMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormValues, setEditFormValues] = useState<MemberFormValues>({ name: '', surname: '', phoneNumber: '', tcId: '' }); // Added name
  const [editFormMessage, setEditFormMessage] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState<boolean>(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [isUpdatingMember, setIsUpdatingMember] = useState<boolean>(false);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const { data, error } = await memberService.getMembers();
      if (error) {
        setMembersError(`Üyeler çekilirken hata oluştu: ${error.message}`);
        setMembers([]);
      } else {
        setMembers(data || []);
      }
    } catch (err: any) {
      setMembersError(`Beklenmedik bir hata oluştu: ${err.message}`);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDeleteMember = async (tcId: string) => {
    if (window.confirm(`TC Kimlik Numarası ${tcId} olan üyeyi silmek istediğinizden emin misiniz?`)) {
      setMembersLoading(true);
      try {
        const { success, error } = await memberService.deleteMember(tcId);
        if (error) {
          alert(`Üye silinirken hata oluştu: ${error.message}`);
        } else if (success) {
          alert('Üye başarıyla silindi.');
          fetchMembers();
        }
      } catch (err: any) {
        alert(`Beklenmedik bir hata oluştu: ${err.message}`);
      } finally {
        setMembersLoading(false);
      }
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setEditFormValues({
      name: member.name, // Added name
      surname: member.surname,
      phoneNumber: member.phoneNumber,
      tcId: member.tcId,
    });
    setEditFormMessage(null);
    setIsEditModalOpen(true);
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
    if (!editingMember) return;

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
      ...editingMember,
      name: editFormValues.name, // Include name
      surname: editFormValues.surname,
      phoneNumber: editFormValues.phoneNumber,
    };

    try {
      const { data, error } = await memberService.updateMember(updatedMember);
      if (error) {
        setEditFormMessage(`Üye güncellenirken bir hata oluştu: ${error.message}`);
      } else if (data) {
        setEditFormMessage('Üye bilgileri başarıyla güncellendi.');
        fetchMembers();
        setTimeout(() => setIsEditModalOpen(false), 1500);
      }
    } catch (err: any) {
      setEditFormMessage(`Beklenmedik bir hata oluştu: ${err.message}`);
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleChangeAdminPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newAdminPassword.length < 4) {
      setAdminPasswordMessage('Şifre en az 4 karakter olmalıdır.');
      return;
    }
    changeAdminPassword(newAdminPassword);
    setAdminPasswordMessage('Yönetici şifresi başarıyla değiştirildi!');
    setNewAdminPassword('');
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Bilinmiyor';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="flex-grow p-6 bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center sm:text-left">Yönetici Paneli</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Admin Password Change */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-1">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Yönetici Şifresini Değiştir</h2>
            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div>
                <label htmlFor="newAdminPassword" className="block text-gray-700 font-semibold mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  id="newAdminPassword"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  required
                  minLength={4}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Şifreyi Değiştir
              </button>
            </form>
            {adminPasswordMessage && (
              <p className="mt-4 text-center text-green-600 font-medium">{adminPasswordMessage}</p>
            )}
          </div>
        </div>

        {/* Member List */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Üye Listesi ({members.length} Üye)</h2>
          {membersLoading ? (
            <p className="text-gray-600 text-center py-4">Üyeler yükleniyor...</p>
          ) : membersError ? (
            <p className="text-red-600 text-center py-4">{membersError}</p>
          ) : members.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Henüz kayıtlı üye bulunmamaktadır.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th> {/* Added Ad column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soyad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TC Kimlik No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th> {/* Added Kayıt Tarihi column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td> {/* Display Ad */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.surname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.tcId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(member.createdAt)}</td> {/* Display Kayıt Tarihi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition duration-200 ease-in-out"
                        aria-label={`Düzenle ${member.name} ${member.surname}`}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.tcId)}
                        className="text-red-600 hover:text-red-900 transition duration-200 ease-in-out"
                        aria-label={`Sil ${member.name} ${member.surname}`}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out w-full sm:w-auto"
        >
          Yönetici Çıkışı Yap
        </button>

        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Üye Bilgilerini Düzenle">
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-gray-700 font-semibold mb-2">Ad</label> {/* Added Ad input */}
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

export default AdminDashboard;