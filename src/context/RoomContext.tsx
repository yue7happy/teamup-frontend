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
    if (storedRooms) {
      const parsedRooms = JSON.parse(storedRooms);
      // 检查是否存在大厅房间，如果不存在则添加
      const hasLobby = parsedRooms.some((room: Room) => room.name === '大厅');
      if (!hasLobby) {
        const lobbyRoom: Room = {
          id: 'lobby',
          name: '大厅',
          creatorId: 'system',
          status: 'active',
          members: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return [lobbyRoom, ...parsedRooms];
      }
      return parsedRooms;
    }
    // 默认创建大厅房间
    const lobbyRoom: Room = {
      id: 'lobby',
      name: '大厅',
      creatorId: 'system',
      status: 'active',
      members: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [lobbyRoom];
  });
  
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>(() => {
    const storedMemberStatuses = localStorage.getItem('memberStatuses');
    return storedMemberStatuses ? JSON.parse(storedMemberStatuses) : [];
  });

  // 清理无效成员（确保成员ID都对应有效用户）
  useEffect(() => {
    const validUserIds = new Set(users.map(user => user.id));
    const updatedRooms = rooms.map(room => ({
      ...room,
      members: room.members.filter(memberId => validUserIds.has(memberId))
    }));
    
    if (JSON.stringify(updatedRooms) !== JSON.stringify(rooms)) {
      setRooms(updatedRooms);
    }
  }, [users, rooms]);

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

  // 当用户登录时，自动加入大厅房间
  useEffect(() => {
    if (currentUser) {
      const lobbyRoom = rooms.find(room => room.name === '大厅');
      if (lobbyRoom && !lobbyRoom.members.includes(currentUser.id)) {
        // 先从所有其他房间移除用户
        const updatedRooms = rooms.map(r => {
          if (r.id === lobbyRoom.id) {
            return {
              ...r,
              members: [...r.members, currentUser.id],
              updatedAt: Date.now(),
            };
          } else {
            return {
              ...r,
              members: r.members.filter(memberId => memberId !== currentUser.id),
              updatedAt: Date.now(),
            };
          }
        });
        
        setRooms(updatedRooms);
        
        // 更新成员状态
        const updatedMemberStatuses = memberStatuses.filter(
          status => status.userId !== currentUser.id
        );
        
        const newMemberStatus: MemberStatus = {
          userId: currentUser.id,
          roomId: lobbyRoom.id,
          joinedAt: Date.now(),
          lastActive: Date.now(),
        };
        
        setMemberStatuses([...updatedMemberStatuses, newMemberStatus]);
      }
    }
  }, [currentUser, rooms, memberStatuses]);

  const createRoom = (name: string) => {
    if (!currentUser) return;
    
    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      creatorId: currentUser.id,
      status: 'active',
      members: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setRooms(prevRooms => [...prevRooms, newRoom]);
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
      // 先从所有其他房间移除用户
      const updatedRooms = rooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            members: [...r.members, currentUser.id],
            updatedAt: Date.now(),
          };
        } else {
          return {
            ...r,
            members: r.members.filter(memberId => memberId !== currentUser.id),
            updatedAt: Date.now(),
          };
        }
      });
      
      setRooms(updatedRooms);
      
      // 更新成员状态
      const updatedMemberStatuses = memberStatuses.filter(
        status => status.userId !== currentUser.id
      );
      
      const newMemberStatus: MemberStatus = {
        userId: currentUser.id,
        roomId,
        joinedAt: Date.now(),
        lastActive: Date.now(),
      };
      
      setMemberStatuses([...updatedMemberStatuses, newMemberStatus]);
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
