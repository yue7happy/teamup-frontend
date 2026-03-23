import React, { useState, useContext } from 'react';
import { RoomContext } from '../context/RoomContext';
import { UserContext } from '../context/UserContext';

const RoomList: React.FC = () => {
  const { rooms, createRoom, deleteRoom, joinRoom } = useContext(RoomContext);
  const { currentUser } = useContext(UserContext);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoom(newRoomName.trim());
      setNewRoomName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('确定要删除这个房间吗？')) {
      deleteRoom(roomId);
    }
  };

  const handleDoubleClick = (roomId: string) => {
    joinRoom(roomId);
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>房间列表</h3>
        {showCreateForm ? (
          <div className="create-room-form">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="输入房间名称"
              className="room-name-input"
            />
            <div className="form-buttons">
              <button onClick={handleCreateRoom} className="create-button">
                创建
              </button>
              <button onClick={() => setShowCreateForm(false)} className="cancel-button">
                取消
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCreateForm(true)} className="add-room-button">
            + 创建房间
          </button>
        )}
      </div>
      <div className="room-items">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="room-item"
            onDoubleClick={() => handleDoubleClick(room.id)}
          >
            <div className="room-info">
              <h4>{room.name}</h4>
              <p>成员: {room.members.length}</p>
            </div>
            {(currentUser?.id === room.creatorId || currentUser?.isAdmin) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRoom(room.id);
                }}
                className="delete-room-button"
              >
                删除
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
