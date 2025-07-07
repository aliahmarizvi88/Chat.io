// src/features/chat/chatSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/chat`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch chats'
      );
    }
  }
);

export const accessChat = createAsyncThunk(
  'chat/accessChat',
  async (userId, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/chat`, { userId });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to access chat'
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/message/${chatId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch messages'
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, chatId }, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/message`, { content, chatId });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to send message'
      );
    }
  }
);

export const clearChat = createAsyncThunk(
  'chat/clearChat',
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.put(`${BASE_URL}/chat/clear/${chatId}`);
      return { chatId, clearedAt: new Date() };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear chat'
      );
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    selectedChat: null,
    messages: [],
    loading: false,
    error: null,
    countUnread: {},
  },
  reducers: {
    setSelectedChat: (state, action) => {
      const selectedChatId = action.payload?._id;
      if (selectedChatId) {
        state.countUnread[selectedChatId] = 0;
      }
      state.selectedChat = action.payload;
    },
    addNewMessage: (state, action) => {
      const { message, currentUserId } = action.payload;
      const chatId = message.chat._id;

      const isCurrentChatOpen = state.selectedChat?._id === chatId;
      if (!isCurrentChatOpen && message.sender._id !== currentUserId) {
        state.countUnread[chatId] = (state.countUnread[chatId] || 0) + 1;
      }

      if (isCurrentChatOpen) {
        state.messages.push(message);
      }

      const existingChatIndex = state.chats.findIndex((c) => c._id === chatId);
      if (existingChatIndex !== -1) {
        const updatedChat = {
          ...state.chats[existingChatIndex],
          latestMessage: message,
        };
        state.chats.splice(existingChatIndex, 1);
        state.chats.unshift(updatedChat);
      } else {
        state.chats.unshift({
          ...message.chat,
          latestMessage: message,
        });
      }
    },
    resetMessages: (state) => {
      state.messages = [];
    },
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      state.chats.forEach((chat) => {
        chat.users = chat.users.map((user) =>
          user._id === userId ? { ...user, isOnline } : user
        );
      });
    },
    updateLatestMessage: (state, action) => {
      const message = action.payload;
      const chatId = message.chat._id;
      const index = state.chats.findIndex((chat) => chat._id === chatId);

      if (index !== -1) {
        const updatedChat = {
          ...state.chats[index],
          latestMessage: message,
        };
        state.chats.splice(index, 1);
        state.chats.unshift(updatedChat);
      } else {
        state.chats.unshift({
          ...message.chat,
          latestMessage: message,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const clearedAtMap = state.selectedChat?.clearedAt || {};
        const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;

        if (clearedAtMap[currentUserId]) {
          const clearedDate = new Date(clearedAtMap[currentUserId]);
          state.messages = action.payload.filter(
            (msg) => new Date(msg.createdAt) > clearedDate
          );
        } else {
          state.messages = action.payload;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(clearChat.fulfilled, (state, action) => {
        const { chatId, clearedAt } = action.payload;
        if (state.selectedChat && state.selectedChat._id === chatId) {
          state.messages = state.messages.filter(
            (msg) => new Date(msg.createdAt) > new Date(clearedAt)
          );
        }
      });
  },
});

export const {
  setSelectedChat,
  addNewMessage,
  resetMessages,
  updateUserOnlineStatus,
  updateLatestMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
