import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Failed to register.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Create Account</h2>
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <div className="mt-6 text-center text-slate-400 text-sm">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
                </div>
            </div>
        </div>
    );
}
