import React from 'react';
import titleImg from '../assets/title2.png';
import Logo from '../assets/LOGO.svg';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="animate-scale-in duration-700">
      <nav className="text-purple-700 px-4 sm:px-6 md:px-8 flex items-center justify-between py-4">
        <Link to="/">
          <img src={Logo} alt="LOGO" className="w-32 h-auto" />
        </Link>
        <div className="flex gap-2">
          <button
            className="bg-purple-700 text-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 font-semibold text-sm sm:text-lg hover:scale-110 duration-300"
            onClick={() => window.open('/signup', '_blank')}
          >
            Register
          </button>
          <button
            className="bg-white text-purple-700 border border-purple-700 rounded-lg px-3 py-2 sm:px-4 sm:py-3 font-semibold text-sm sm:text-lg hover:scale-110 duration-300"
            onClick={() => window.open('/login', '_blank')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mt-6 mx-4 sm:mx-8 bg-purple-700 text-white rounded-2xl flex flex-col-reverse md:flex-row items-center overflow-hidden">
        <div className="p-6 md:p-12 w-full md:w-1/2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 headFont">
            <b>Chat.io</b> – A place to connect with like-minded people
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-6 bodyFont">
            It's a space designed for meaningful conversations. Whether you're
            catching up with friends, meeting new people, or collaborating with
            teammates, Chat.io brings you closer to those who share your
            interests. With real-time messaging, secure profiles, and a smooth
            interface, you're always just a message away from your next great
            connection.
          </p>
          <button
            className="bg-white text-purple-700 text-sm sm:text-lg font-bold px-6 py-3 rounded-xl hover:scale-105 transition"
            onClick={() => window.open('/signup', '_blank')}
          >
            Start Chat!
          </button>
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <img
            src={titleImg}
            alt="Hero"
            className="w-full max-h-80 object-contain mx-auto"
          />
        </div>
      </div>

      {/* Features Section */}
      <section className="my-12 px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
        {[
          {
            icon: '🛡️',
            title: 'Private & Secure',
            description:
              'End-to-end encrypted chats to keep your conversations safe.',
          },
          {
            icon: '⚡',
            title: 'Real-Time Messaging',
            description:
              'Experience lightning-fast messaging without refreshes.',
          },
          {
            icon: '👥',
            title: 'Connect Instantly',
            description: 'Find and chat with like-minded users easily.',
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="p-6 bg-white rounded-xl shadow-md hover:scale-105 transition"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-lg sm:text-xl font-bold text-purple-700">
              {feature.title}
            </h3>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-purple-700 text-white py-8 text-center px-4">
        <p className="text-sm sm:text-base">
          © {new Date().getFullYear()} Chat.io | All rights reserved.
        </p>
        <div className="flex justify-center gap-4 mt-2 text-xs sm:text-sm flex-wrap">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Use
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
