import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserState, UserContextType } from '../types/user';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const initialOwner: User = {
  id: 'user-1',
  nickname: '紫罗兰',
  password: '152720',
  role: 'owner'
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, setState] = useState<UserState>(() => {
    // 尝试从localStorage加载数据
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        return {
          users: parsedUsers,
          currentUser: null,
          isAuthenticated: false
        };
      } catch (error) {
        // 如果解析失败，使用初始数据
        return {
          users: [initialOwner],
          currentUser: null,
          isAuthenticated: false
        };
      }
    }
    // 如果localStorage中没有数据，使用初始数据
    return {
      users: [initialOwner],
      currentUser: null,
      isAuthenticated: false
    };
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(state.users));
  }, [state.users]);

  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [state.currentUser]);

  // 离线清理功能：页面关闭或断网时从房间移除
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 这里可以添加清理逻辑，例如通知服务器用户离线
      // 在实际项目中，可能需要发送请求到服务器
      console.log('用户离线，清理资源');
    };

    // 监听localStorage变化，实现不同标签页之间的状态同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'users') {
        try {
          const parsedUsers = JSON.parse(e.newValue || '[]');
          setState(prev => ({
            ...prev,
            users: parsedUsers
          }));
        } catch (error) {
          console.error('解析用户数据失败:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (nickname: string, password: string): boolean => {
    const user = state.users.find(u => u.nickname === nickname && u.password === password);
    if (user) {
      setState(prev => ({
        ...prev,
        currentUser: user,
        isAuthenticated: true
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      currentUser: null,
      isAuthenticated: false
    }));
    // 清除聊天记录（这里简化处理，实际项目中可能需要更复杂的清理）
    localStorage.removeItem('chatHistory');
  };

  const addUser = (nickname: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      nickname,
      password: '123456',
      role: 'user'
    };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  const setAdmin = (userId: string, isAdmin: boolean) => {
    if (state.currentUser?.role !== 'owner') return;
    
    setState(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === userId 
          ? { ...user, role: isAdmin ? 'admin' : 'user' }
          : user
      )
    }));
  };

  const changePassword = (userId: string, newPassword: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === userId 
          ? { ...user, password: newPassword }
          : user
      ),
      currentUser: prev.currentUser?.id === userId 
        ? { ...prev.currentUser, password: newPassword }
        : prev.currentUser
    }));
  };

  const removeUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId),
      currentUser: prev.currentUser?.id === userId 
        ? null
        : prev.currentUser,
      isAuthenticated: prev.currentUser?.id === userId 
        ? false
        : prev.isAuthenticated
    }));
  };



  const value: UserContextType = {
    state,
    login,
    logout,
    addUser,
    setAdmin,
    changePassword,
    removeUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};