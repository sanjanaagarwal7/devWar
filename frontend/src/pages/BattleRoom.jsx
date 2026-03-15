import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Sandpack } from '@codesandbox/sandpack-react';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';

import ChatBox from '../components/ChatBox';

export default function BattleRoom() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [challenge, setChallenge] = useState(null);
    const [battleState, setBattleState] = useState('active'); // active, finished
    const [winner, setWinner] = useState(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins

    const wsRef = useRef(null);

    useEffect(() => {
        // Load challenge info
        const cid = location.state?.challengeId;
        if (cid && cid !== -1) {
            api.get(`/challenges/${cid}`).then(res => setChallenge(res.data));
        } else {
            // fallback generic challenge since random DB pull might fail empty
            setChallenge({
                title: "Mystery Challenge",
                description: "Write a function that returns true.",
                language: "Vanilla",
                starterCode: "function solve() {\n  \n}"
            });
        }

        // Connect WS
        const ws = new WebSocket('ws://localhost:8080/ws/battle');
        ws.onopen = () => {
            // Resend presence just in case we reconnected
            ws.send(JSON.stringify({ event: 'player_joined', username: user.username }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === 'battle_finished') {
                setBattleState('finished');
                setWinner(data.winner);
            }
        };

        wsRef.current = ws;

        // Timer logic
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [id, location.state, user.username]);

    const handleSubmit = () => {
        // A real implementation would parse the sandpack AST or run a test runner against their code output
        // Here, we just assume that pressing submit means they solved it
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                event: 'code_submitted',
                isCorrect: true
            }));
        }
    };

    const handleLeave = () => {
        navigate('/dashboard');
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!challenge) return <div className="text-center mt-20 text-slate-400 font-mono animate-pulse">Initializing Battle Arena...</div>;

    const opponent = location.state?.players?.find(p => p !== user.username) || "Opponent";

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* Top Header */}
            <div className="bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-4 w-1/3">
                    <div className="bg-blue-600 px-4 py-2 rounded-lg font-bold">{user.username}</div>
                    <span className="text-slate-500 font-black italic">VS</span>
                    <div className="bg-red-600 px-4 py-2 rounded-lg font-bold">{opponent}</div>
                </div>

                <div className="w-1/3 text-center">
                    <div className={`text-3xl font-mono font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="w-1/3 flex justify-end">
                    <button onClick={handleLeave} className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded border border-slate-600 transition-colors">
                        Surrender
                    </button>
                </div>
            </div>

            {battleState === 'finished' ? (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700 text-center shadow-2xl scale-110">
                        <div className="text-8xl mb-6">{winner === user.username ? '🏆' : '💀'}</div>
                        <h2 className={`text-5xl font-black mb-4 ${winner === user.username ? 'text-amber-400' : 'text-red-500'}`}>
                            {winner === user.username ? 'VICTORY' : 'DEFEAT'}
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto text-lg hover:text-white transition-colors">
                            {winner === user.username
                                ? "You engineered a flawless solution before your opponent. Elo points have been awarded."
                                : `${winner} outcoded you this time. Shake it off and try again.`}
                        </p>
                        <button
                            onClick={handleLeave}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105"
                        >
                            Return to Base
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Arena Content */}
            <div className="flex-1 flex w-full">
                {/* Left Side: Challenge Config */}
                <div className="w-1/3 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-500/50 mb-4 inline-block shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                            Live Battle
                        </span>
                        <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
                        <div className="prose prose-invert prose-blue">
                            <p className="text-slate-300 leading-relaxed font-serif whitespace-pre-wrap">{challenge.description}</p>
                        </div>

                        <div className="mt-8 bg-slate-900/50 p-4 rounded border border-slate-700/50 font-mono text-sm">
                            <div className="text-slate-500 mb-1">Expected Validation Match:</div>
                            <div className="text-green-400">{challenge.expectedOutput}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] text-xl mt-6"
                    >
                        EXECUTE SOLUTION
                    </button>
                </div>

                {/* Right Side: IDE & Chat */}
                <div className="w-2/3 flex flex-col">
                    <div className="h-[70%]">
                        <Sandpack
                            theme="dark"
                            template={challenge.language?.toLowerCase() === 'react' ? 'react' : 'vanilla'}
                            files={{
                                ...(challenge.language?.toLowerCase() === 'react' ? {
                                    '/App.js': challenge.starterCode
                                } : {
                                    '/index.js': challenge.starterCode
                                })
                            }}
                            options={{
                                showNavigator: false,
                                showLineNumbers: true,
                                editorHeight: '100%',
                                classes: {
                                    "sp-wrapper": "h-full",
                                    "sp-layout": "h-full",
                                }
                            }}
                        />
                    </div>
                    {/* Real-time battle chat */}
                    <div className="h-[30%]">
                        <ChatBox roomId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
