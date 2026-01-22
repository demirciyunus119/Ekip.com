export interface Member {
  id: string; // TC Kimlik No as unique ID
  name: string; // New field for member's name
  surname: string;
  phoneNumber: string;
  tcId: string;
  createdAt?: string; // Optional field for registration timestamp
}

export interface AuthContextType {
  isAdmin: boolean;
  memberId: string | null;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  loginMember: (tcId: string) => boolean;
  logoutMember: () => void;
  changeAdminPassword: (newPassword: string) => void;
}

export interface MemberFormValues {
  name: string; // New field for member's name
  surname: string;
  phoneNumber: string;
  tcId: string;
}