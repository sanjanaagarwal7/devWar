import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

export default function Navbar() {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    DevWar
                </Link>
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
                            <Link to="/learn" className="hover:text-blue-400 transition-colors">Learn</Link>
                            <Link to="/war" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">🔥 War Mode</Link>
                            <Link to="/leaderboard" className="hover:text-amber-400 transition-colors">Leaderboard</Link>
                            <div className="flex items-center gap-4 ml-4 border-l border-slate-700 pl-4">
                                <span className="text-slate-300">
                                    {user.username} <span className="text-xs bg-slate-700 px-2 py-1 rounded-full ml-1">elo {user.rating}</span>
                                </span>
                                <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
