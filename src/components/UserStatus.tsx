import React from 'react';
import { useUser } from '../context/UserContext';
import { useRoom } from '../context/RoomContext';
import type { RoomStatus } from '../types/room';

const UserStatus: React.FC = () => {
  const { state: userState } = useUser();
  const { state: roomState, updateMemberStatus } = useRoom();
  const { currentUser } = userState;
  const { currentRoomId, rooms } = roomState;

  // 获取当前房间
  const currentRoom = rooms.find(room => room.id === currentRoomId);
  // 获取当前用户在当前房间中的状态
  const currentMemberStatus = currentRoom?.members.find(member => member.userId === currentUser?.id);
  const userStatus = currentMemberStatus?.status || 'idle';

  const handleStatusChange = (status: RoomStatus) => {
    if (currentUser && currentRoomId && currentRoomId !== 'lobby') {
      updateMemberStatus(currentRoomId, currentUser.id, status);
    }
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'matching':
        return '#ea4335';
      case 'in_game':
        return '#34a853';
      case 'idle':
        return '#1a73e8';
      default:
        return '#1a73e8';
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#1d1d1f',
        margin: '0 0 20px 0'
      }}>状态管理</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ 
          fontSize: '14px', 
          color: '#6e6e73',
          margin: '0 0 12px 0'
        }}>当前状态: <span style={{ 
          fontWeight: '500',
          color: getStatusColor(userStatus)
        }}>{userStatus === 'idle' ? '空闲' : userStatus === 'in_game' ? '游戏中' : '匹配中'}</span></p>
        {currentRoomId === 'lobby' && (
          <p style={{ 
            fontSize: '14px', 
            color: '#6e6e73',
            margin: '0'
          }}>在大厅中无法修改状态</p>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => handleStatusChange('idle')}
          disabled={currentRoomId === 'lobby'}
          style={{
            flex: '1',
            padding: '10px 16px',
            backgroundColor: currentRoomId === 'lobby' ? '#f0f0f0' : userStatus === 'idle' ? '#1a73e8' : '#f0f0f0',
            color: currentRoomId === 'lobby' ? '#1d1d1f' : userStatus === 'idle' ? 'white' : '#1d1d1f',
            border: 'none',
            borderRadius: '8px',
            cursor: currentRoomId === 'lobby' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          空闲
        </button>
        <button
          onClick={() => handleStatusChange('in_game')}
          disabled={currentRoomId === 'lobby'}
          style={{
            flex: '1',
            padding: '10px 16px',
            backgroundColor: currentRoomId === 'lobby' ? '#f0f0f0' : userStatus === 'in_game' ? '#34a853' : '#f0f0f0',
            color: currentRoomId === 'lobby' ? '#1d1d1f' : userStatus === 'in_game' ? 'white' : '#1d1d1f',
            border: 'none',
            borderRadius: '8px',
            cursor: currentRoomId === 'lobby' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          游戏中
        </button>
        <button
          onClick={() => handleStatusChange('matching')}
          disabled={currentRoomId === 'lobby'}
          style={{
            flex: '1',
            padding: '10px 16px',
            backgroundColor: currentRoomId === 'lobby' ? '#f0f0f0' : userStatus === 'matching' ? '#ea4335' : '#f0f0f0',
            color: currentRoomId === 'lobby' ? '#1d1d1f' : userStatus === 'matching' ? 'white' : '#1d1d1f',
            border: 'none',
            borderRadius: '8px',
            cursor: currentRoomId === 'lobby' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          匹配中
        </button>
      </div>
    </div>
  );
};

export default UserStatus;