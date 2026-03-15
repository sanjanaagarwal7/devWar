import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sandpack } from '@codesandbox/sandpack-react';
import api from '../services/api';

export default function LessonPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.get(`/challenges/${id}`)
            .then(res => setChallenge(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = (e) => {
        // In a real scenario we'd run tests against the user code or evaluate the AST.
        // For this prototype, we'll just simulate a successful submit if they click it.
        e.preventDefault();
        setSuccess(true);
        setTimeout(() => {
            navigate('/learn');
        }, 2000);
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 font-mono animate-pulse">Loading Environment...</div>;
    if (!challenge) return <div className="text-center mt-20 text-red-400">Challenge Not Found!</div>;

    return (
        <div className="h-[calc(100vh-80px)] w-full flex flex-col md:flex-row">
            {/* Left panel - Instructions */}
            <div className="w-full md:w-1/3 bg-slate-900 border-r border-slate-700 p-6 overflow-y-auto">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white mb-6">&larr; Back</button>
                <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider">
                    {challenge.language}
                </span>
                <h1 className="text-3xl font-bold mt-4 mb-2">{challenge.title}</h1>
                <div className="flex items-center gap-2 mb-8">
                    <span className={`w-2 h-2 rounded-full ${challenge.difficulty === 'Easy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-slate-400 text-sm">{challenge.difficulty}</span>
                </div>

                <div className="prose prose-invert prose-blue mb-8">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-8">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Expected Output Match:</h4>
                    <code className="text-green-400 bg-slate-900 border border-green-500/20 px-2 py-1 rounded select-all">
                        {challenge.expectedOutput}
                    </code>
                </div>

                {success ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 font-bold animate-pulse">
                        <span>🎉</span> Challenge Completed! Returning...
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        Submit Solution
                    </button>
                )}
            </div>

            {/* Right panel - IDE */}
            <div className="w-full md:w-2/3 h-full">
                <Sandpack
                    theme="dark"
                    template={challenge.language.toLowerCase() === 'react' ? 'react' : 'vanilla'}
                    files={{
                        ...(challenge.language.toLowerCase() === 'react' ? {
                            '/src/App.js': challenge.starterCode
                        } : {
                            '/src/index.js': challenge.starterCode
                        })
                    }}
                    options={{
                        showNavigator: false,
                        showLineNumbers: true,
                        editorHeight: 'calc(100vh - 80px)', // adjust for navbar
                        classes: {
                            "sp-wrapper": "h-full",
                            "sp-layout": "h-full",
                        }
                    }}
                />
            </div>
        </div>
    );
}
