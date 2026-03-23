import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import type { UserStatus as UserStatusType } from '../types/user';

const UserStatus: React.FC = () => {
  const { currentUser, updateUserStatus } = useContext(UserContext);

  const handleStatusChange = (status: UserStatusType) => {
    updateUserStatus(status);
  };

  if (!currentUser) return null;

  return (
    <div className="user-status">
      <div className="user-status-header">
        <h3>状态管理</h3>
        <div className="current-status">
          <span className="status-label">当前状态:</span>
          <span className={`status-badge ${currentUser.status}`}>
            {currentUser.status === 'idle' ? '空闲' : 
             currentUser.status === 'matching' ? '匹配中' : '游戏中'}
          </span>
        </div>
      </div>
      <div className="status-buttons">
        <button
          className={`status-button ${currentUser.status === 'idle' ? 'active' : ''}`}
          onClick={() => handleStatusChange('idle')}
        >
          空闲
        </button>
        <button
          className={`status-button ${currentUser.status === 'matching' ? 'active' : ''}`}
          onClick={() => handleStatusChange('matching')}
        >
          匹配中
        </button>
        <button
          className={`status-button ${currentUser.status === 'gaming' ? 'active' : ''}`}
          onClick={() => handleStatusChange('gaming')}
        >
          游戏中
        </button>
      </div>
    </div>
  );
};

export default UserStatus;
