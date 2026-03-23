import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';

const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser, setAdminStatus, currentUser } = useContext(UserContext);
  const [newUsername, setNewUsername] = useState('');

  const handleAddUser = () => {
    if (newUsername.trim()) {
      addUser(newUsername.trim());
      setNewUsername('');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      deleteUser(userId);
    }
  };

  const handleSetAdmin = (userId: string, isAdmin: boolean) => {
    setAdminStatus(userId, isAdmin);
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h3>用户管理</h3>
        <div className="add-user-form">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="输入新用户名"
            className="username-input"
          />
          <button onClick={handleAddUser} className="add-user-button">
            添加用户
          </button>
        </div>
      </div>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <h4>{user.username}</h4>
              <div className="user-roles">
                {user.isOwner && <span className="role-badge owner">房主</span>}
                {user.isAdmin && !user.isOwner && <span className="role-badge admin">管理员</span>}
              </div>
            </div>
            {(currentUser?.isOwner || currentUser?.isAdmin) && !user.isOwner && (
              <div className="user-actions">
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={user.isAdmin}
                    onChange={(e) => handleSetAdmin(user.id, e.target.checked)}
                  />
                  管理员
                </label>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="delete-user-button"
                >
                  删除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
