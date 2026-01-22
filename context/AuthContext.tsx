import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContextType } from '../types';
import { localStorageService } from '../services/localStorageService';
import { memberService } from '../services/memberService'; // Import the new service
import { DEFAULT_ADMIN_PASSWORD } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Initialize admin password if not set
  useEffect(() => {
    if (!localStorage.getItem('admin_password')) {
      localStorageService.setAdminPassword(DEFAULT_ADMIN_PASSWORD);
    }
  }, []);

  const loginAdmin = useCallback((password: string): boolean => {
    if (localStorageService.getAdminPassword() === password) {
      setIsAdmin(true);
      setMemberId(null); // Ensure no member is logged in when admin is
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
  }, []);

  const loginMember = useCallback(async (tcId: string): Promise<boolean> => {
    // Now uses Supabase to check for member existence
    const { data: member, error } = await memberService.getMemberById(tcId);
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found (not an actual error for "not found")
      console.error('Error fetching member:', error);
      return false;
    }
    if (member) {
      setMemberId(tcId);
      setIsAdmin(false); // Ensure admin is not logged in when member is
      return true;
    }
    return false;
  }, []);

  const logoutMember = useCallback(() => {
    setMemberId(null);
  }, []);

  const changeAdminPassword = useCallback((newPassword: string) => {
    localStorageService.setAdminPassword(newPassword);
  }, []);

  const contextValue = React.useMemo(() => ({
    isAdmin,
    memberId,
    loginAdmin,
    logoutAdmin,
    loginMember,
    logoutMember,
    changeAdminPassword,
  }), [isAdmin, memberId, loginAdmin, logoutAdmin, loginMember, logoutMember, changeAdminPassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};