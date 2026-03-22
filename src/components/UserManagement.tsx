import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const UserManagement: React.FC = () => {
  const [newNickname, setNewNickname] = useState('');
  const { state, addUser, setAdmin, removeUser } = useUser();
  const { users } = state;

  const handleAddUser = () => {
    if (newNickname) {
      addUser(newNickname);
      setNewNickname('');
    }
  };

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
      }}>用户管理</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '500', 
          color: '#1d1d1f',
          margin: '0 0 12px 0'
        }}>添加用户</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder="输入用户名"
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
            onClick={handleAddUser}
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
            添加
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '500', 
          color: '#1d1d1f',
          margin: '0 0 16px 0'
        }}>用户列表</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {users.map(user => (
            <li key={user.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div>
                <span style={{ 
                  fontSize: '14px',
                  color: '#1d1d1f'
                }}>{user.nickname}</span>
                <span style={{ 
                  marginLeft: '12px', 
                  fontSize: '13px', 
                  color: '#6e6e73',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: user.role === 'owner' ? '#f0f0f0' : user.role === 'admin' ? '#e3f2fd' : '#f0f0f0'
                }}>
                  {user.role === 'owner' ? '房主' : user.role === 'admin' ? '管理员' : '普通用户'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {user.role !== 'owner' && (
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '14px',
                    color: '#1d1d1f'
                  }}>
                    管理员
                    <input
                      type="checkbox"
                      checked={user.role === 'admin'}
                      onChange={(e) => setAdmin(user.id, e.target.checked)}
                      style={{ 
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                  </label>
                )}
                {user.role !== 'owner' && (
                  <button
                    onClick={() => removeUser(user.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ff4757',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
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
                    删除
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;