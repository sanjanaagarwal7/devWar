import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const user = getCurrentUser();

    useEffect(() => {
        if (user?.username) {
            api.get(`/battles/user/${user.username}`)
                .then(res => setStats(res.data))
                .catch(console.error);
        }
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto p-6 mt-8">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Profile Sidebar */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{user?.username}</h2>
                                <div className="text-amber-400 font-mono">Elo Rating: {stats?.rating || user?.rating}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-lg text-center border border-slate-700">
                                <div className="text-3xl font-bold text-green-400">{stats?.wins || user?.wins || 0}</div>
                                <div className="text-sm text-slate-400 uppercase tracking-wider mt-1">Wins</div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg text-center border border-slate-700">
                                <div className="text-3xl font-bold text-red-400">{stats?.losses || user?.losses || 0}</div>
                                <div className="text-sm text-slate-400 uppercase tracking-wider mt-1">Losses</div>
                            </div>
                        </div>
                    </div>

                    <Link to="/war" className="block w-full">
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:bg-orange-300 transition-all"></div>
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                ⚔️ Enter War Mode
                            </h3>
                            <p className="text-orange-100/80 mb-4">Compete in real-time 1v1 coding battles to increase your Elo rating.</p>
                            <div className="inline-flex items-center text-white font-medium">
                                Find Match &rarr;
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Tracks Main Content */}
                <div className="w-full md:w-2/3">
                    <h2 className="text-3xl font-bold mb-6">Learning Tracks</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        <Link to="/learn/react" className="group">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors h-full">
                                <div className="text-4xl mb-4">⚛️</div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">React Track</h3>
                                <p className="text-slate-400">Master modern React development, hooks, state management, and ecosystem tools.</p>
                            </div>
                        </Link>

                        <Link to="/learn/spring" className="group">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-green-500 transition-colors h-full">
                                <div className="text-4xl mb-4">🍃</div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">Spring Boot Track</h3>
                                <p className="text-slate-400">Build robust enterprise backends, REST APIs, and database integrations with Java.</p>
                            </div>
                        </Link>

                        <Link to="/learn/node" className="group">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-yellow-500 transition-colors h-full">
                                <div className="text-4xl mb-4">🟢</div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">Node.js + Express Track</h3>
                                <p className="text-slate-400">Learn server-side JavaScript, API design, middleware, and asynchronous programming.</p>
                            </div>
                        </Link>

                        <Link to="/learn/sql" className="group">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors h-full">
                                <div className="text-4xl mb-4">🗄️</div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">Database Track</h3>
                                <p className="text-slate-400">Master SQL, relational database design, complex queries, and optimization.</p>
                            </div>
                        </Link>

                    </div>
                </div>

            </div>
        </div>
    );
}
