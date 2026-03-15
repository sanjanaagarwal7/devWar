import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Learn() {
    const { track } = useParams();
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper mappings
    const tracks = {
        react: { id: 'React', title: 'React Track', icon: '⚛️', color: 'text-blue-400' },
        spring: { id: 'Spring Boot', title: 'Spring Boot Track', icon: '🍃', color: 'text-green-400' },
        node: { id: 'Node.js', title: 'Node.js + Express Track', icon: '🟢', color: 'text-yellow-400' },
        sql: { id: 'SQL', title: 'Database Track', icon: '🗄️', color: 'text-purple-400' }
    };

    const currentTrack = track ? tracks[track] : null;

    useEffect(() => {
        if (currentTrack) {
            setLoading(true);
            api.get(`/challenges/track/${currentTrack.id}`)
                .then(res => setChallenges(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        } else if (track) {
            navigate('/learn'); // redirect invalid tracks
        }
    }, [track, currentTrack, navigate]);

    if (!track) {
        // Show all tracks overview if no track selected
        return (
            <div className="max-w-7xl mx-auto p-6 mt-8">
                <h1 className="text-4xl font-bold mb-8">Learning Hub</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(tracks).map(([key, info]) => (
                        <Link key={key} to={`/learn/${key}`} className="group">
                            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-slate-500 transition-all hover:-translate-y-1 shadow-lg text-center h-full">
                                <div className="text-6xl mb-6">{info.icon}</div>
                                <h3 className={`text-xl font-bold ${info.color}`}>{info.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 mt-8">
            <Link to="/learn" className="text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2">
                &larr; Back to Tracks
            </Link>

            <div className="flex items-center gap-4 mb-10">
                <div className="text-5xl">{currentTrack.icon}</div>
                <h1 className={`text-4xl font-bold ${currentTrack.color}`}>{currentTrack.title}</h1>
            </div>

            {loading ? (
                <div className="text-slate-400 animate-pulse font-mono">Loading challenges...</div>
            ) : (
                <div className="space-y-4">
                    {challenges.map((challenge, i) => (
                        <Link key={challenge.id} to={`/lesson/${challenge.id}`} className="block group">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 group-hover:border-slate-500 transition-colors flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-mono text-slate-500 mb-1">Lesson {i + 1}</div>
                                    <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">{challenge.title}</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${challenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {challenge.difficulty}
                                    </span>
                                    <div className="bg-blue-600/20 text-blue-400 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        Start Code &rarr;
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {challenges.length === 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-12 text-center text-slate-500">
                            No lessons available in this track yet. Check back soon!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
