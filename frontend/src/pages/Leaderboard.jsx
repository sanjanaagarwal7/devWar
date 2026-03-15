import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/battles/leaderboard')
            .then(res => setUsers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center mt-20 text-xl font-mono text-slate-400 animate-pulse">Loading rankings...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 mt-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">Global Leaderboard</h1>
                <div className="text-4xl">🏆</div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700">
                            <th className="p-5 font-semibold text-slate-300">Rank</th>
                            <th className="p-5 font-semibold text-slate-300">Developer</th>
                            <th className="p-5 font-semibold text-slate-300 text-center">W / L</th>
                            <th className="p-5 font-semibold text-amber-400 text-right">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                <td className="p-5 font-bold text-slate-400">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </td>
                                <td className="p-5 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    {user.username}
                                </td>
                                <td className="p-5 text-center text-slate-400">
                                    <span className="text-green-400">{user.wins}</span> - <span className="text-red-400">{user.losses}</span>
                                </td>
                                <td className="p-5 text-right font-mono font-bold text-amber-400 text-lg">
                                    {user.rating}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center p-8 text-slate-500 italic">No competitors yet. Be the first to enter the War Mode!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
