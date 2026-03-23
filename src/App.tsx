import React, { useContext } from 'react';
import { UserContext } from './context/UserContext';
import { UserProvider } from './context/UserContext';
import { RoomProvider } from './context/RoomContext';
import Login from './components/Login';
import RoomList from './components/RoomList';
import UserManagement from './components/UserManagement';
import UserStatus from './components/UserStatus';
import ChangePassword from './components/ChangePassword';
import './App.css';

const AppContent: React.FC = () => {
  const { currentUser, logout } = useContext(UserContext);

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Teamup</h1>
        <div className="user-info">
          <span className="username">{currentUser.username}</span>
          <button onClick={logout} className="logout-button">
            退出登录
          </button>
        </div>
      </header>
      <main className="app-main">
        <div className="sidebar">
          <RoomList />
        </div>
        <div className="content">
          <UserStatus />
          <div className="management-section">
            <UserManagement />
            <ChangePassword />
          </div>
        </div>
      </main>
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
