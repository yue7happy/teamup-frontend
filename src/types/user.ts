export type UserRole = 'owner' | 'admin' | 'user';
export interface User {
  id: string;
  nickname: string;
  password: string;
  role: UserRole;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface UserContextType {
  state: UserState;
  login: (nickname: string, password: string) => boolean;
  logout: () => void;
  addUser: (nickname: string) => void;
  setAdmin: (userId: string, isAdmin: boolean) => void;
  changePassword: (userId: string, newPassword: string) => void;
  removeUser: (userId: string) => void;
}