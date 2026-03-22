import React from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { RoomProvider, useRoom } from './context/RoomContext';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import ChangePassword from './components/ChangePassword';
import RoomList from './components/RoomList';
import UserStatus from './components/UserStatus';

const AppContent: React.FC = () => {
  const { state, logout } = useUser();
  const { state: roomState } = useRoom();
  const { isAuthenticated, currentUser } = state;

  if (!isAuthenticated) {
    return <Login />;
  }

  const currentRoom = roomState.rooms.find(room => room.id === roomState.currentRoomId);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f5f5f7',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1d1d1f',
            margin: 0
          }}>Teamup 聊天系统</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ 
              fontSize: '14px', 
              color: '#6e6e73'
            }}>欢迎，{currentUser?.nickname}（{currentUser?.role === 'owner' ? '房主' : currentUser?.role === 'admin' ? '管理员' : '普通用户'}）</span>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff3742';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ff4757';
              }}
            >
              退出登录
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <RoomList />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1' }}>
            {currentUser?.role === 'owner' && (
              <UserManagement />
            )}
            <UserStatus />
            <ChangePassword />
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1d1d1f',
              margin: 0
            }}>当前房间：{currentRoom?.name}</h2>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#1d1d1f',
              margin: '0 0 12px 0'
            }}>房间成员</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {currentRoom?.members.map(member => {
                const user = state.users.find(user => user.id === member.userId);
                return (
                  <li key={member.userId} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    {user?.nickname || '未知用户'}
                  </li>
                );
              })}
            </ul>
          </div>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#1d1d1f',
            margin: '0 0 12px 0'
          }}>聊天区域</h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6e6e73',
            margin: 0
          }}>聊天功能开发中...</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <RoomProvider>
        <AppContent />
      </RoomProvider>
    </UserProvider>
  );
};

export default App;