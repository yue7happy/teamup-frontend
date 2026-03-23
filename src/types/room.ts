import type { User } from './user';

export type RoomStatus = 'active' | 'inactive';

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  status: RoomStatus;
  members: string[]; // user ids
  createdAt: number;
  updatedAt: number;
}

export interface MemberStatus {
  userId: string;
  roomId: string;
  joinedAt: number;
  lastActive: number;
}

export interface RoomContextType {
  rooms: Room[];
  memberStatuses: MemberStatus[];
  createRoom: (name: string) => void;
  deleteRoom: (roomId: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  getRoomMembers: (roomId: string) => User[];
}
