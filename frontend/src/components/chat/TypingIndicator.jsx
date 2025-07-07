import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/socketContext';

const TypingIndicator = ({ selectedChat }) => {
  const [typing, setTyping] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleTyping = () => setTyping(true);
    const handleStopTyping = () => setTyping(false);

    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [socket, selectedChat?._id]);

  if (!typing) return null;

  return (
    <div className="text-sm text-gray-500 italic animate-pulse pl-2">
      typing...
    </div>
  );
};

export default TypingIndicator;
