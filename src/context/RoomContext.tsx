import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Room, RoomState, RoomContextType, RoomStatus } from '../types/room';
import { useUser } from './UserContext';

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

// 默认大厅
const defaultLobby: Room = {
  id: 'lobby',
  name: '大厅',
  members: [],
  capacity: 100,
  status: 'idle',
  createdAt: new Date(),
  creatorId: 'system'
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { state: userState } = useUser();
  const [state, setState] = useState<RoomState>(() => {
    // 尝试从localStorage加载数据
    const savedRooms = localStorage.getItem('rooms');
    const savedCurrentRoomId = localStorage.getItem('currentRoomId');
    
    if (savedRooms) {
      try {
        const parsedRooms = JSON.parse(savedRooms);
        // 确保至少有一个大厅房间
        const hasLobby = parsedRooms.some((room: Room) => room.id === 'lobby');
        return {
          rooms: hasLobby ? parsedRooms : [defaultLobby, ...parsedRooms],
          currentRoomId: savedCurrentRoomId || 'lobby'
        };
      } catch (error) {
        // 如果解析失败，使用初始数据
        return {
          rooms: [defaultLobby],
          currentRoomId: 'lobby'
        };
      }
    }
    // 如果localStorage中没有数据，使用初始数据
    return {
      rooms: [defaultLobby],
      currentRoomId: 'lobby'
    };
  });

  // 当用户登录时，将用户添加到当前房间
  useEffect(() => {
    if (userState.currentUser) {
      setState(prev => {
        // 检查用户是否已经在当前房间中
        const currentRoom = prev.rooms.find(room => room.id === prev.currentRoomId);
        if (currentRoom && !currentRoom.members.some(member => member.userId === userState.currentUser!.id)) {
          const updatedRooms = prev.rooms.map(room => {
            if (room.id === prev.currentRoomId) {
              return {
                ...room,
                members: [...room.members, { userId: userState.currentUser!.id, status: 'idle' as RoomStatus }]
              };
            }
            return room;
          });
          return { ...prev, rooms: updatedRooms };
        }
        return prev;
      });
    }
  }, [userState.currentUser]);

  useEffect(() => {
    // 保存所有房间数据到localStorage，包括大厅
    localStorage.setItem('rooms', JSON.stringify(state.rooms));
  }, [state.rooms]);

  useEffect(() => {
    if (state.currentRoomId) {
      localStorage.setItem('currentRoomId', state.currentRoomId);
    }
  }, [state.currentRoomId]);

  // 监听localStorage变化，实现不同标签页之间的状态同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rooms') {
        try {
          const parsedRooms = JSON.parse(e.newValue || '[]');
          // 确保至少有一个大厅房间
          const hasLobby = parsedRooms.some((room: Room) => room.id === 'lobby');
          const updatedRooms = hasLobby ? parsedRooms : [defaultLobby, ...parsedRooms];
          setState({
            rooms: updatedRooms,
            currentRoomId: state.currentRoomId
          });
        } catch (error) {
          console.error('解析房间数据失败:', error);
        }
      } else if (e.key === 'currentRoomId') {
        setState(prev => ({
          ...prev,
          currentRoomId: e.newValue || 'lobby'
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.currentRoomId]);

  const createRoom = (name: string) => {
    if (!userState.currentUser) return;
    
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      members: [],
      capacity: 30,
      status: 'idle',
      createdAt: new Date(),
      creatorId: userState.currentUser.id
    };
    
    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  const deleteRoom = (roomId: string) => {
    if (roomId === 'lobby') return;
    
    setState(prev => {
      const updatedRooms = prev.rooms.filter(room => room.id !== roomId);
      const newCurrentRoomId = prev.currentRoomId === roomId ? 'lobby' : prev.currentRoomId;
      
      // 处理房间成员，将被删除房间的成员转移到大厅
      const roomToDelete = prev.rooms.find(room => room.id === roomId);
      let updatedRoomsWithMembers = [...updatedRooms];
      
      if (roomToDelete) {
        updatedRoomsWithMembers = updatedRoomsWithMembers.map(room => {
          if (room.id === 'lobby') {
            const membersToAdd = roomToDelete.members.map(member => ({
              userId: member.userId,
              status: 'idle' as const
            }));
            return {
              ...room,
              members: [...room.members, ...membersToAdd]
            };
          }
          return room;
        });
      }
      
      return {
        rooms: updatedRoomsWithMembers,
        currentRoomId: newCurrentRoomId
      };
    });
  };

  const updateRoomName = (roomId: string, newName: string) => {
    if (roomId === 'lobby') return;
    
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId ? { ...room, name: newName } : room
      )
    }));
  };

  const joinRoom = (roomId: string) => {
    if (!userState.currentUser) return;
    
    setState(prev => {
      const room = prev.rooms.find(r => r.id === roomId);
      if (!room) return prev;
      
      // 检查用户是否已经在目标房间中
      if (room.members.some(member => member.userId === userState.currentUser!.id)) {
        // 如果用户已经在房间中，只更新当前房间ID
        return {
          ...prev,
          currentRoomId: roomId
        };
      }
      
      if (room.members.length >= room.capacity) {
        alert('房间已满');
        return prev;
      }
      
      // 创建更新后的房间列表
      const updatedRooms = prev.rooms.map(r => {
        if (r.id === roomId) {
          // 添加用户到目标房间
          return {
            ...r,
            members: [...r.members, { userId: userState.currentUser!.id, status: 'idle' as RoomStatus }]
          };
        }
        if (r.id === prev.currentRoomId) {
          // 从当前房间移除用户
          return {
            ...r,
            members: r.members.filter(member => member.userId !== userState.currentUser!.id)
          };
        }
        return r;
      });
      
      // 返回更新后的状态
      return {
        rooms: updatedRooms,
        currentRoomId: roomId
      };
    });
  };

  const leaveRoom = () => {
    if (!userState.currentUser) return;
    
    setState(prev => {
      if (prev.currentRoomId === 'lobby') return prev;
      
      const updatedRooms = prev.rooms.map(r => {
        if (r.id === prev.currentRoomId) {
          return {
            ...r,
            members: r.members.filter(member => member.userId !== userState.currentUser!.id)
          };
        }
        if (r.id === 'lobby') {
          return {
            ...r,
            members: [...r.members, { userId: userState.currentUser!.id, status: 'idle' as RoomStatus }]
          };
        }
        return r;
      });
      
      return {
        rooms: updatedRooms,
        currentRoomId: 'lobby'
      };
    });
  };

  const updateMemberStatus = (roomId: string, userId: string, status: RoomStatus) => {
    setState(prev => {
      const updatedRooms = prev.rooms.map(room => {
        if (room.id === roomId) {
          const updatedMembers = room.members.map(member => {
            if (member.userId === userId) {
              return { ...member, status };
            }
            return member;
          });
          return { ...room, members: updatedMembers };
        }
        return room;
      });
      return { ...prev, rooms: updatedRooms };
    });
  };

  const value: RoomContextType = {
    state,
    createRoom,
    deleteRoom,
    updateRoomName,
    joinRoom,
    leaveRoom,
    updateMemberStatus
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};