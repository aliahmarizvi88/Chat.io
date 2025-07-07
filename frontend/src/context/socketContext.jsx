// src/context/SocketProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNewMessage } from '../features/chat/chatSlice';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.warn('Sound blocked:', err.message));
    }
  };

  useEffect(() => {
    if (!user) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      query: { userId: user._id },
    });

    setSocket(newSocket);

    newSocket.on('message received', (newMessage) => {
      const chatId = newMessage.chat._id;

      if (!selectedChat || selectedChat._id !== chatId) {
        playNotificationSound();

        toast.info(
          `${newMessage.sender.username}: ${newMessage.content.slice(0, 50)}${
            newMessage.content.length > 50 ? '...' : ''
          }`,
          {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: false,
            pauseOnHover: true,
          }
        );
      }

      dispatch(addNewMessage({ message: newMessage, currentUserId: user._id }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch, selectedChat]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
