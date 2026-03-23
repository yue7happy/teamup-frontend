export type UserStatus = 'idle' | 'matching' | 'gaming';

export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  isOwner: boolean;
  status: UserStatus;
  lastActive: number;
}
