export type RoomStatus = 'idle' | 'in_game' | 'matching';

export interface MemberStatus {
  userId: string;
  status: RoomStatus;
}

export interface Room {
  id: string;
  name: string;
  members: MemberStatus[]; // 用户ID和状态列表
  capacity: number;
  status: RoomStatus;
  createdAt: Date;
  creatorId: string;
}

export interface RoomState {
  rooms: Room[];
  currentRoomId: string | null;
}

export interface RoomContextType {
  state: RoomState;
  createRoom: (name: string) => void;
  deleteRoom: (roomId: string) => void;
  updateRoomName: (roomId: string, newName: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  updateMemberStatus: (roomId: string, userId: string, status: RoomStatus) => void;
}