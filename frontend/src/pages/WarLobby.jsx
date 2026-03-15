import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function WarLobby() {
    const [status, setStatus] = useState('idle'); // idle, matchmaking, found
    const [stompClient, setStompClient] = useState(null);
    const user = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        // connect to ws
        const socket = new SockJS('http://localhost:8080/ws/battle');
        const client = Stomp.over(socket);
        client.debug = () => { }; // disable debug spam

        client.connect({}, () => {
            setStompClient(client);
        }, (error) => {
            console.error(error);
        });

        return () => {
            if (client) client.disconnect();
        };
    }, []);

    const handleFindMatch = () => {
        if (!stompClient) return;
        setStatus('matchmaking');

        // Subscribe to matchmaking topic (broadcasting for simplicity in this proto)
        stompClient.subscribe('/topic/matchmaking', (message) => {
            // Not used with the logic we built in backend, we should use direct STOMP mapping
            // But since we built raw handler, we use SockJS directly or rewrite backend.
        });

        // Oh wait, our backend uses `TextWebSocketHandler` directly, not STOMP!
        // Stomp was configured but the handler is mapped statically to `/ws/battle`.
        // Let's rewrite frontend to use standard WebSocket.
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 relative overflow-hidden">

            {/* Background decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] -z-10"></div>

            <div className="text-center mb-12">
                <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
                    WAR MODE
                </h1>
                <p className="text-xl text-slate-400 max-w-lg mx-auto">
                    Test your skills in real-time 1v1 coding battles.
                    Match against developers of similar rank, solve the challenge first, and steal their Elo.
                </p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/10 w-full max-w-md text-center backdrop-blur-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-4xl shadow-inner border border-slate-600 relative overflow-hidden">
                        {user?.username.charAt(0).toUpperCase()}
                        {status === 'matchmaking' && (
                            <div className="absolute inset-0 bg-orange-500/20 animate-pulse"></div>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-1">{user?.username}</h2>
                <div className="text-orange-400 font-mono mb-8">Rank <span className="font-bold">{user?.rating}</span></div>

                {status === 'idle' ? (
                    <button
                        onClick={() => setStatus('matchmaking_ws_connect')}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-xl tracking-widest relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        ENTER QUEUE
                    </button>
                ) : status === 'matchmaking_ws_connect' ? (
                    <WarQueue setStatus={setStatus} navigate={navigate} username={user.username} />
                ) : (
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold animate-pulse">
                        Match Found! Connecting...
                    </div>
                )}
            </div>

        </div>
    );
}

// Separate component to handle pure WebSocket logic for the matching queue
function WarQueue({ setStatus, navigate, username }) {
    const [socket, setSocket] = useState(null);
    const [time, setTime] = useState(0);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080/ws/battle');

        ws.onopen = () => {
            ws.send(JSON.stringify({ event: 'player_joined', username }));
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === 'match_found') {
                setStatus('found');
                setTimeout(() => {
                    navigate(`/battle/${data.roomId}`, { state: { challengeId: data.challengeId, players: data.players } });
                }, 1500);
            }
        };

        const interval = setInterval(() => setTime(t => t + 1), 1000);

        return () => {
            clearInterval(interval);
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [username, navigate, setStatus]);

    const cancelSearch = () => {
        setStatus('idle');
    };

    return (
        <div className="space-y-4">
            <div className="text-orange-400 animate-pulse font-mono mb-4 text-lg">
                Searching for opponent...
            </div>
            <div className="text-slate-500 font-mono text-sm mb-6">
                Time Elapsed: 00:{time.toString().padStart(2, '0')}
            </div>

            <div className="flex gap-2 justify-center pb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>

            <button
                onClick={cancelSearch}
                className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-wide border-b border-transparent hover:border-slate-500"
            >
                Cancel
            </button>
        </div>
    );
}
