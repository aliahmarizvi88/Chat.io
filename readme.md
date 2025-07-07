# Chat.io

A full-stack real-time chat application built with React.js, Node.js/Express, MongoDB, Redux Toolkit, Socket.io, and TailwindCSS.

## Features

- User authentication (signup, login, logout)
- Real-time messaging with Socket.io
- Group and private chats
- Profile management (including profile picture upload)
- Responsive UI with TailwindCSS
- Toast notifications for user feedback
- Protected routes and session persistence
- Search and start new chats

## Tech Stack

- **Frontend:** React.js, Redux Toolkit, TailwindCSS, React Router, React Toastify, Axios, Socket.io-client, Formik, Yup
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.io, JWT, Multer, Cloudinary
- **Other:** ESLint, Morgan, dotenv

## Folder Structure

```
backend/
  controllers/
  middleware/
  models/
  routes/
  config/
  utils/
  uploads/
  index.js
  package.json

frontend/
  src/
    components/
    context/
    features/
    pages/
    Redux/
    services/
    utils/
    App.jsx
    main.jsx
    index.css
  public/
  package.json
  tailwind.config.js
  vite.config.js
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and set your environment variables (MongoDB URI, JWT secret, etc.).
  ```BACKEND.env:
  PORT = 5000
  MONGO_URI = YOUR _MONGO_URI 
  JWT_SECRET = YOUR_JWT_SECERT KEY

  USER_EMAIL = YOUR_EMAIL
  EMAIL_PASS = YOUR_PASS
  ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Environment Variables

- **Backend:**

  - `MONGO_URI` - MongoDB connection string
  - `JWT_SECRET` - Secret for JWT

- **Frontend:**
  - Usually not required unless you use environment variables for API URLs.

## Usage

- Visit `http://localhost:5173` in your browser.
- Register a new account or log in.
- Start chatting in real time!

## Scripts

- **Backend:**

  - `npm run dev` — Start backend with nodemon
  - `npm start` — Start backend in production

- **Frontend:**
  - `npm run dev` — Start frontend in development
  - `npm run build` — Build frontend for production

## Linting

- ESLint is configured for both frontend and backend. Run `npm run lint` in each folder to check code quality.

## Customization

- Update TailwindCSS classes for custom UI.
- Add more features (file sharing, notifications, etc.) as needed.
