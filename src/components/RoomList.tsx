import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { useUser } from '../context/UserContext';

const RoomList: React.FC = () => {
  const { state: roomState, createRoom, deleteRoom, updateRoomName, joinRoom } = useRoom();
  const { state: userState } = useUser();
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomName, setEditRoomName] = useState('');

  const handleCreateRoom = () => {
    if (newRoomName) {
      createRoom(newRoomName);
      setNewRoomName('');
    }
  };

  const handleUpdateRoomName = (roomId: string) => {
    if (editRoomName) {
      updateRoomName(roomId, editRoomName);
      setEditingRoomId(null);
      setEditRoomName('');
    }
  };

  const getMemberNames = (members: { userId: string; status: string }[]) => {
    return members
      .map(member => userState.users.find(user => user.id === member.userId)?.nickname || '未知用户')
      .slice(0, 3);
  };

  const getRoomStatus = (members: { userId: string; status: 'idle' | 'in_game' | 'matching' }[]) => {
    // 优先级：匹配中 > 游戏中 > 空闲
    if (members.some(member => member.status === 'matching')) {
      return 'matching';
    } else if (members.some(member => member.status === 'in_game')) {
      return 'in_game';
    } else {
      return 'idle';
    }
  };

  const getRoomColor = (status: 'idle' | 'in_game' | 'matching') => {
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

  const isAdmin = userState.currentUser?.role === 'owner' || userState.currentUser?.role === 'admin';

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      flex: '1',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#1d1d1f',
        margin: '0 0 20px 0'
      }}>房间列表</h2>
      
      {isAdmin && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#1d1d1f',
            margin: '0 0 12px 0'
          }}>创建房间</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="输入房间名称"
              style={{
                flex: '1',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            />
            <button
              onClick={handleCreateRoom}
              style={{
                padding: '10px 16px',
                backgroundColor: '#007aff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0066cc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007aff';
              }}
            >
              创建
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '500', 
          color: '#1d1d1f',
          margin: '0 0 16px 0'
        }}>房间列表</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {roomState.rooms.map(room => (
            <li key={room.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              border: room.id === roomState.currentRoomId ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              marginBottom: '12px',
              backgroundColor: getRoomColor(getRoomStatus(room.members)),
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }} onDoubleClick={() => joinRoom(room.id)}>
              <div style={{ flex: '1' }}>
                {editingRoomId === room.id ? (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editRoomName}
                      onChange={(e) => setEditRoomName(e.target.value)}
                      style={{
                        flex: '1',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                    />
                    <button
                      onClick={() => handleUpdateRoomName(room.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingRoomId(null)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontWeight: '500',
                        fontSize: '14px',
                        color: 'white'
                      }}>{room.name}</span>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'white'
                      }}></span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '6px' }}>
                      人数: {room.members.length}/{room.capacity}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
                      成员: {getMemberNames(room.members).join(', ')}
                      {room.members.length > 3 && `...等${room.members.length}人`}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && room.id !== 'lobby' && (
                  <>
                    <button
                      onClick={() => {
                        setEditingRoomId(room.id);
                        setEditRoomName(room.name);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                    >
                      改名
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这个房间吗？')) {
                          deleteRoom(room.id);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                    >
                      删除
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomList;