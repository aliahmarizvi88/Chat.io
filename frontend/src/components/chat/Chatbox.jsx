import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMessages,
  sendMessage,
  addNewMessage,
  resetMessages,
  updateLatestMessage,
  clearChat,
} from '../../features/chat/chatSlice';
import { blockUser, unblockUser } from '../../features/auth/authSlice';
import { SendHorizonal, Loader2, Smile } from 'lucide-react';
import { useSocket } from '../../context/socketContext';
import TypingIndicator from './TypingIndicator';
import { getInitials } from '../getInitial';
import { toast } from 'react-toastify';
import DropDown from './DropDown';
import EmojiPicker from 'emoji-picker-react';
import ConfirmDialog from './ConfirmDialog';

const Chatbox = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const { selectedChat, messages, loading } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localIsBlocked, setLocalIsBlocked] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const typingDelay = 3000;

  const otherUser =
    selectedChat?.isGroupChat === false && user?._id
      ? selectedChat.users?.find((u) => u._id !== user._id)
      : null;

  useEffect(() => {
    setLocalIsBlocked(user?.blockedUsers?.includes(otherUser?._id));
  }, [user, otherUser]);

  useEffect(() => {
    if (selectedChat?._id) {
      dispatch(fetchMessages(selectedChat._id));
      socket?.emit('join chat', selectedChat._id);
    }
    return () => {
      dispatch(resetMessages());
    };
  }, [selectedChat, socket, dispatch]);

  useEffect(() => {
    if (!socket || !selectedChat?._id) return;

    const handleReceive = (newMsg) => {
      if (newMsg.chat._id === selectedChat._id) {
        dispatch(addNewMessage(newMsg));
      }
      dispatch(updateLatestMessage(newMsg));
    };

    socket.on('message received', handleReceive);
    return () => socket.off('message received', handleReceive);
  }, [socket, selectedChat, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat?._id) return;

    if (localIsBlocked) {
      toast.error('You have blocked this user. Unblock to send messages.');
      return;
    }

    try {
      const result = await dispatch(
        sendMessage({ content: newMessage, chatId: selectedChat._id })
      ).unwrap();

      socket?.emit('new message', result);
      dispatch(updateLatestMessage(result));
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socket || !selectedChat?._id) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop typing', selectedChat._id);
      setIsTyping(false);
    }, typingDelay);
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const confirmClearChat = () => {
    setDialogAction(() => async () => {
      try {
        await dispatch(clearChat(selectedChat._id)).unwrap();
        await dispatch(fetchMessages(selectedChat._id));
        toast.success('Chat Cleared Successfully');
      } catch (error) {
        toast.error(error?.message || 'Failed to clear chat');
      }
    });
    setConfirmDialogOpen(true);
  };

  const confirmBlockUser = () => {
    setDialogAction(() => async () => {
      try {
        if (localIsBlocked) {
          await dispatch(unblockUser(otherUser._id)).unwrap();
          toast.success('User unblocked');
        } else {
          await dispatch(blockUser(otherUser._id)).unwrap();
          toast.success('User blocked');
        }
      } catch (err) {
        toast.error(err || 'Action failed');
      }
    });
    setConfirmDialogOpen(true);
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a chat to begin
      </div>
    );
  }

  const chatTitle = selectedChat.isGroupChat
    ? selectedChat.chatName
    : otherUser?.username || 'Chat';

  return (
    <div className="flex flex-col h-full bg-white shadow">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold flex items-center gap-3 headFont">
        {selectedChat.isGroupChat === false && (
          <>
            {otherUser?.profilePic ? (
              <img
                src={`http://localhost:5000/${otherUser.profilePic.replace(
                  /\\/g,
                  '/'
                )}`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-semibold text-xs">
                {getInitials(otherUser?.username || '')}
              </div>
            )}
          </>
        )}
        <span>{chatTitle}</span>
        <div className="ml-auto relative">
          <DropDown
            onClearChat={confirmClearChat}
            onBlockUser={confirmBlockUser}
            isBlocked={localIsBlocked}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-purple-50 bodyFont">
        {loading ? (
          <div className="text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2" />
            Loading messages...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.sender._id === user._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs text-sm ${
                  msg.sender._id === user._id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        <TypingIndicator selectedChat={selectedChat} />
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t flex items-center gap-2">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-xl p-2 text-white bg-purple-700 rounded-full hover:bg-purple-800"
        >
          <Smile />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-2 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            localIsBlocked
              ? 'You have blocked this user.'
              : 'Type your message...'
          }
          disabled={localIsBlocked}
          className={`flex-1 px-4 py-2 border rounded-xl focus:ring-2 outline-none ${
            localIsBlocked
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'focus:ring-purple-500'
          }`}
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 p-2 rounded-full hover:bg-purple-700 text-white"
        >
          <SendHorizonal />
        </button>
        <ConfirmDialog
          isOpen={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={dialogAction}
          title={
            dialogAction === confirmClearChat
              ? 'Clear Chat'
              : localIsBlocked
              ? 'Unblock User'
              : 'Block User'
          }
          message={
            dialogAction === confirmClearChat
              ? 'Are you sure you want to clear this chat? This action cannot be undone.'
              : localIsBlocked
              ? 'Are you sure you want to unblock this user?'
              : 'Are you sure you want to block this user? You won’t receive messages from them.'
          }
        />
        h
      </div>
    </div>
  );
};

export default Chatbox;
