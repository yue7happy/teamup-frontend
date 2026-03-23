import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserStatus } from '../types/user';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (username: string) => void;
  updateUserStatus: (status: UserStatus) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  setAdminStatus: (userId: string, isAdmin: boolean) => void;
  deleteUser: (userId: string) => void;
}

export const UserContext = createContext<UserContextType>({
  users: [],
  currentUser: null,
  login: () => false,
  logout: () => {},
  addUser: () => {},
  updateUserStatus: () => {},
  changePassword: () => false,
  setAdminStatus: () => {},
  deleteUser: () => {},
});

const initialUsers: User[] = [
  {
    id: '1',
    username: '紫罗兰',
    password: '152720',
    isAdmin: true,
    isOwner: true,
    status: 'idle',
    lastActive: Date.now(),
  },
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      // 检查是否存在房主账号，如果不存在则添加
      const hasOwner = parsedUsers.some((user: User) => user.isOwner);
      if (!hasOwner) {
        return [...parsedUsers, ...initialUsers];
      }
      return parsedUsers;
    }
    return initialUsers;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('chatHistory');
    }
  }, [currentUser]);

  // 监听存储事件，实现跨标签页同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'users') {
        const updatedUsers = e.newValue ? JSON.parse(e.newValue) : [];
        setUsers(updatedUsers);
      }
      if (e.key === 'currentUser' && !e.newValue) {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const updatedUser = { ...user, lastActive: Date.now() };
      setCurrentUser(updatedUser);
      
      // 更新用户列表中的最后活跃时间
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? updatedUser : u)
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (username: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password: '123456',
      isAdmin: false,
      isOwner: false,
      status: 'idle',
      lastActive: Date.now(),
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateUserStatus = (status: UserStatus) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, status, lastActive: Date.now() };
      setCurrentUser(updatedUser);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === currentUser.id ? updatedUser : u)
      );
    }
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (currentUser && currentUser.password === oldPassword) {
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === currentUser.id ? updatedUser : u)
      );
      return true;
    }
    return false;
  };

  const setAdminStatus = (userId: string, isAdmin: boolean) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, isAdmin } : u)
    );
  };

  const deleteUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId && !u.isOwner));
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        login,
        logout,
        addUser,
        updateUserStatus,
        changePassword,
        setAdminStatus,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
