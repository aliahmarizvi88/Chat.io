import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { LogOut, MessageSquare, User } from 'lucide-react';
import Logo from '../../assets/LOGO.svg';

const Nav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-screen w-16 bg-gradient-to-b from-purple-500 to-purple-900 text-white flex flex-col border-r-2  items-center justify-between py-4 fixed top-0 left-0 shadow-lg">
      <img src={Logo} alt="" />

      <div className="flex flex-col gap-6 mt-10">
        <Link to="/chat" title="Chats">
          <MessageSquare className="w-6 h-6 hover:scale-110 transition duration-200" />
        </Link>
        <Link to="/profile" title="profile">
          <User className="w-6 h-6 hover:scale-110 transition duration-200" />
        </Link>
      </div>
      <button onClick={handleLogout} title="Logout">
        <LogOut className="w-6 h-6 hover:scale-110 transition duration-200" />
      </button>
    </div>
  );
};

export default Nav;
