import { LS_ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD } from '../constants';
// Member related imports removed as they are now handled by Supabase.

export const localStorageService = {
  getAdminPassword(): string {
    return localStorage.getItem(LS_ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  },

  setAdminPassword(password: string): void {
    localStorage.setItem(LS_ADMIN_PASSWORD_KEY, password);
  },

  // Member-related functions removed from here.
  // getMembers, setMembers, addMember, getMemberById, updateMember, deleteMember
  // These operations are now handled by direct Supabase calls or a dedicated Supabase service if needed.
};
