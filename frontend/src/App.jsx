import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './services/authService';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import LessonPage from './pages/LessonPage';
import WarLobby from './pages/WarLobby';
import BattleRoom from './pages/BattleRoom';
import Leaderboard from './pages/Leaderboard';

function PrivateRoute({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
          <Route path="/learn/:track" element={<PrivateRoute><Learn /></PrivateRoute>} />
          <Route path="/lesson/:id" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
          <Route path="/war" element={<PrivateRoute><WarLobby /></PrivateRoute>} />
          <Route path="/battle/:id" element={<PrivateRoute><BattleRoom /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}
