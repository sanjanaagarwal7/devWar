import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../services/authService';

export default function ChatBox({ roomId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const user = getCurrentUser();
    const wsRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080/ws/chat');

        ws.onopen = () => {
            // no auth handshake required for prototype
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.roomId === roomId || roomId === 'lobby') {
                setMessages(prev => [...prev, data]);
            }
        };

        wsRef.current = ws;

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const payload = {
            roomId: roomId || 'lobby',
            sender: user.username,
            message: input,
            timestamp: new Date().toISOString()
        };

        wsRef.current.send(JSON.stringify(payload));
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 w-80 shrink-0 shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] z-20">
            <div className="p-4 bg-slate-800 border-b border-slate-700 font-bold flex items-center gap-2">
                <span>💬</span> Global Chat {roomId !== 'lobby' && '(Room)'}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === user.username ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-slate-500 mb-1 px-1">{msg.sender}</span>
                        <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${msg.sender === user.username ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} className="h-1" />
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-2 text-sm">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
