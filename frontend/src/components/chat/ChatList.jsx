import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getInitials } from '../getInitial';
import {
  fetchChats,
  setSelectedChat,
  accessChat,
} from '../../features/chat/chatSlice';
import axios from 'axios';

const ChatList = () => {
  const dispatch = useDispatch();
  const { chats, selectedChat, loading, countUnread } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  if (!user) return null;

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (!query.trim()) return setSearchResults([]);

    try {
      const res = await axios.get(
        `http://localhost:5000/user?search=${query}`,
        { withCredentials: true }
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error:', err.response?.data?.message);
    }
  };

  const handleAccessChat = (userId) => {
    dispatch(setSelectedChat(null));
    dispatch(fetchChats());
    dispatch(accessChat(userId));
    setSearchTerm('');
    setSearchResults([]);
  };

  const sortedChats = [...chats].sort((a, b) => {
    const aTime = new Date(a.latestMessage?.createdAt || 0);
    const bTime = new Date(b.latestMessage?.createdAt || 0);
    return bTime - aTime;
  });

  return (
    <div className="w-full max-w-sm h-screen overflow-y-auto border-r border-gray-200 bg-white shadow-sm bodyFont">
      {/* Search Bar */}
      <div className="p-4 sticky top-0 bg-white z-10 border-b-1 border-purple-600">
        <input
          type="text"
          placeholder="🔍 Search users"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="p-4">
          <p className="text-sm text-gray-400 mb-2">Search Results</p>
          {searchResults.map((u) => (
            <div
              key={u._id}
              onClick={() => handleAccessChat(u._id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-200 cursor-pointer transition hover:translate-y-2"
            >
              <div className="relative">
                <img
                  src={
                    u.profilePic
                      ? `http://localhost:5000/${u.profilePic.replace(
                          /\\/g,
                          '/'
                        )}`
                      : 'https://placehold.co/40x40'
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                {u.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{u.username}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat List */}
      <div className="p-4">
        <p className="text-sm text-gray-400 mb-2">Your Chats</p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading chats...</p>
        ) : (
          sortedChats.map((chat) => {
            const otherUser = !chat.isGroupChat
              ? chat.users.find((u) => u._id !== user?._id)
              : null;

            const unreadCount = countUnread[chat._id] || 0;

            return (
              <div
                key={chat._id}
                onClick={() => dispatch(setSelectedChat(chat))}
                className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition duration-200 ${
                  selectedChat?._id === chat._id
                    ? 'bg-purple-100 shadow'
                    : 'hover:bg-purple-200'
                }`}
              >
                <div className="relative">
                  {otherUser?.profilePic ? (
                    <img
                      src={`http://localhost:5000/${otherUser.profilePic.replace(
                        /\\/g,
                        '/'
                      )}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-semibold text-sm uppercase">
                      {getInitials(otherUser?.username || '')}
                    </span>
                  )}
                  {otherUser?.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">
                    {chat.isGroupChat ? chat.chatName : otherUser?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.latestMessage?.content || 'No messages yet'}
                  </p>
                </div>

                {/* Unread badge */}
                {unreadCount > 0 && (
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
