import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const { state, changePassword } = useUser();
  const { currentUser } = state;

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('请填写所有字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('两次输入的密码不一致');
      return;
    }

    if (currentUser) {
      changePassword(currentUser.id, newPassword);
      setMessage('密码修改成功');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
      }}>修改密码</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#1d1d1f'
        }}>旧密码</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#1d1d1f'
        }}>新密码</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#1d1d1f'
        }}>确认新密码</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}
        />
      </div>
      
      {message && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: message === '密码修改成功' ? '#e8f5e8' : '#ffebee',
          color: message === '密码修改成功' ? '#2e7d32' : '#c62828',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}
      
      <button
        onClick={handleChangePassword}
        style={{
          width: '100%',
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
        修改密码
      </button>
    </div>
  );
};

export default ChangePassword;