import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Room, RoomStatus, MemberStatus, RoomContextType } from '../types/room';
import { UserContext } from './UserContext';
import type { User } from '../types/user';

export const RoomContext = createContext<RoomContextType>({
  rooms: [],
  memberStatuses: [],
  createRoom: () => {},
  deleteRoom: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  updateRoomStatus: () => {},
  getRoomMembers: () => [],
});

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, users } = useContext(UserContext);
  
  const [rooms, setRooms] = useState<Room[]>(() => {
    const storedRooms = localStorage.getItem('rooms');
    return storedRooms ? JSON.parse(storedRooms) : [];
  });
  
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>(() => {
    const storedMemberStatuses = localStorage.getItem('memberStatuses');
    return storedMemberStatuses ? JSON.parse(storedMemberStatuses) : [];
  });

  useEffect(() => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('memberStatuses', JSON.stringify(memberStatuses));
  }, [memberStatuses]);

  // 监听存储事件，实现跨标签页同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rooms') {
        const updatedRooms = e.newValue ? JSON.parse(e.newValue) : [];
        setRooms(updatedRooms);
      }
      if (e.key === 'memberStatuses') {
        const updatedMemberStatuses = e.newValue ? JSON.parse(e.newValue) : [];
        setMemberStatuses(updatedMemberStatuses);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 处理用户离线：关闭页面或断网时从所有房间移除
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        // 从所有房间移除用户
        const updatedRooms = rooms.map(room => ({
          ...room,
          members: room.members.filter(memberId => memberId !== currentUser.id),
        }));
        setRooms(updatedRooms);
        
        // 清除用户的所有成员状态
        const updatedMemberStatuses = memberStatuses.filter(
          status => status.userId !== currentUser.id
        );
        setMemberStatuses(updatedMemberStatuses);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, rooms, memberStatuses]);

  const createRoom = (name: string) => {
    if (!currentUser) return;
    
    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      creatorId: currentUser.id,
      status: 'active',
      members: [currentUser.id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setRooms(prevRooms => [...prevRooms, newRoom]);
    
    const newMemberStatus: MemberStatus = {
      userId: currentUser.id,
      roomId: newRoom.id,
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };
    
    setMemberStatuses(prevStatuses => [...prevStatuses, newMemberStatus]);
  };

  const deleteRoom = (roomId: string) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    setMemberStatuses(prevStatuses => prevStatuses.filter(status => status.roomId !== roomId));
  };

  const joinRoom = (roomId: string) => {
    if (!currentUser) return;
    
    // 检查用户是否已经在房间中
    const room = rooms.find(r => r.id === roomId);
    if (room && !room.members.includes(currentUser.id)) {
      const updatedRoom = {
        ...room,
        members: [...room.members, currentUser.id],
        updatedAt: Date.now(),
      };
      
      setRooms(prevRooms => 
        prevRooms.map(r => r.id === roomId ? updatedRoom : r)
      );
      
      const newMemberStatus: MemberStatus = {
        userId: currentUser.id,
        roomId,
        joinedAt: Date.now(),
        lastActive: Date.now(),
      };
      
      setMemberStatuses(prevStatuses => [...prevStatuses, newMemberStatus]);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (!currentUser) return;
    
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedRoom = {
        ...room,
        members: room.members.filter(memberId => memberId !== currentUser.id),
        updatedAt: Date.now(),
      };
      
      setRooms(prevRooms => 
        prevRooms.map(r => r.id === roomId ? updatedRoom : r)
      );
      
      setMemberStatuses(prevStatuses => 
        prevStatuses.filter(status => !(status.userId === currentUser.id && status.roomId === roomId))
      );
    }
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prevRooms => 
      prevRooms.map(room => room.id === roomId ? { ...room, status, updatedAt: Date.now() } : room)
    );
  };

  const getRoomMembers = (roomId: string): User[] => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return [];
    return users.filter(user => room.members.includes(user.id));
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        memberStatuses,
        createRoom,
        deleteRoom,
        joinRoom,
        leaveRoom,
        updateRoomStatus,
        getRoomMembers,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
