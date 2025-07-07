import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ChatPage from '../pages/ChatPage';
import Profile from '../pages/Profile';
import ProtectedRoute from './ProtectedRoute';
import RedirectIfAuthenticated from './RedirectIfAuthenticated ';

const Index = () => {
  const Navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="*"
          element={<Navigate to={user ? '/chat' : '/login'} replace />}
        />
      </Routes>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default Index;
