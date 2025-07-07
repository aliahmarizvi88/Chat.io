import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../context/socketContext';
import Nav from '../components/chat/Nav';
import ChatList from '../components/chat/ChatList';
import Chatbox from '../components/chat/Chatbox';
import { updateUserOnlineStatus, fetchChats } from '../features/chat/chatSlice';

const ChatPage = () => {
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && socket) {
      socket.emit('setup', user);
      dispatch(fetchChats());
    }
  }, [user, socket, dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = ({ userId }) => {
      dispatch(updateUserOnlineStatus({ userId, isOnline: true }));
    };

    const handleUserOffline = ({ userId }) => {
      dispatch(updateUserOnlineStatus({ userId, isOnline: false }));
    };

    socket.on('user online', handleUserOnline);
    socket.on('user offline', handleUserOffline);

    return () => {
      socket.off('user online', handleUserOnline);
      socket.off('user offline', handleUserOffline);
    };
  }, [socket, dispatch]);

  return (
    <div className="flex h-screen">
      <Nav />
      <div className="ml-16 flex flex-1">
        <ChatList />
        <div className="flex-1 h-full">
          <Chatbox />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
