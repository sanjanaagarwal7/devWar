import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    useSandpack
} from '@codesandbox/sandpack-react';
import api from '../services/api';

// Custom React entry that posts rendered HTML to parent for validation
const REACT_VALIDATION_ENTRY = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

const send = () => {
  window.parent.postMessage({ type: '__devwar__', html: rootEl.innerHTML }, '*');
};
new MutationObserver(send).observe(rootEl, {
  childList: true, subtree: true, attributes: true, characterData: true
});
setTimeout(send, 500);
`;

// ── Mock database for SQL challenges ──
const MOCK_DB = {
    users: [
        { id: 1, username: 'player1', email: 'p1@devwar.com', rating: 1250 },
        { id: 2, username: 'player2', email: 'p2@devwar.com', rating: 1100 },
        { id: 3, username: 'player3', email: 'p3@devwar.com', rating: 1400 },
        { id: 4, username: 'player4', email: 'p4@devwar.com', rating: 950 },
    ],
    challenges: [
        { id: 1, title: 'React Counter', difficulty: 'Easy', language: 'React' },
        { id: 2, title: 'Toggle Visibility', difficulty: 'Easy', language: 'React' },
        { id: 3, title: 'Todo List', difficulty: 'Medium', language: 'React' },
        { id: 4, title: 'Hello World API', difficulty: 'Easy', language: 'Spring Boot' },
        { id: 5, title: 'Middleware Logger', difficulty: 'Medium', language: 'Node.js' },
    ],
};

function runSQL(sql) {
    const cleaned = sql.replace(/--.*$/gm, '').replace(/\n/g, ' ').trim().replace(/;$/, '');
    if (!cleaned) return 'No query to execute.';

    const m = cleaned.match(
        /SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i
    );
    if (!m) return 'Error: Only SELECT queries are supported.\nExample: SELECT * FROM users';

    const [, cols, table, where, groupBy, orderBy] = m;
    const tbl = table.toLowerCase();
    if (!MOCK_DB[tbl]) return `Error: Table '${table}' not found.\nAvailable: ${Object.keys(MOCK_DB).join(', ')}`;

    let rows = MOCK_DB[tbl].map(r => ({ ...r }));

    if (where) {
        const cond = where.match(/(\w+)\s*(>=|<=|!=|>|<|=)\s*('([^']*)'|"([^"]*)"|(\d+))/);
        if (cond) {
            const col = cond[1];
            const op = cond[2];
            const val = cond[4] ?? cond[5] ?? Number(cond[6]);
            rows = rows.filter(r => {
                const v = r[col];
                if (v === undefined) return false;
                switch (op) {
                    case '>': return v > val;
                    case '<': return v < val;
                    case '>=': return v >= val;
                    case '<=': return v <= val;
                    case '=': return String(v) === String(val);
                    case '!=': return String(v) !== String(val);
                    default: return true;
                }
            });
        }
    }

    if (orderBy) {
        const parts = orderBy.trim().split(/\s+/);
        const col = parts[0];
        const desc = (parts[1] || '').toUpperCase() === 'DESC';
        rows.sort((a, b) => {
            if (typeof a[col] === 'string') return desc ? b[col].localeCompare(a[col]) : a[col].localeCompare(b[col]);
            return desc ? b[col] - a[col] : a[col] - b[col];
        });
    }

    if (groupBy) {
        const gCol = groupBy.trim();
        const groups = {};
        rows.forEach(r => { groups[r[gCol]] = (groups[r[gCol]] || 0) + 1; });
        const pad = (s, n) => String(s).padEnd(n);
        const hdr = `${pad(gCol, 16)}| count`;
        const sep = '-'.repeat(hdr.length);
        const dr = Object.entries(groups).map(([k, v]) => `${pad(k, 16)}| ${v}`);
        return `${dr.length} group(s)\n\n${hdr}\n${sep}\n${dr.join('\n')}`;
    }

    let selCols;
    if (cols.trim() === '*') {
        selCols = Object.keys(MOCK_DB[tbl][0]);
    } else {
        selCols = cols.split(',').map(c => c.trim().replace(/^count\(\*\)$/i, '__count__'));
    }

    const pad = (s, n) => String(s ?? '').padEnd(n);
    const w = 16;
    const hdr = selCols.map(c => pad(c, w)).join('| ');
    const sep = '-'.repeat(hdr.length);
    const dr = rows.map(r => selCols.map(c => pad(r[c], w)).join('| '));
    return `${rows.length} row(s) returned\n\n${hdr}\n${sep}\n${dr.join('\n')}`;
}

function runNodeJS(code) {
    try {
        const routes = [];
        const middlewares = [];
        const logs = [];

        const mockExpress = () => {
            const app = {
                get: (path, ...handlers) => routes.push({ method: 'GET', path, handler: handlers[handlers.length - 1] }),
                post: (path, ...handlers) => routes.push({ method: 'POST', path, handler: handlers[handlers.length - 1] }),
                put: (path, ...handlers) => routes.push({ method: 'PUT', path, handler: handlers[handlers.length - 1] }),
                delete: (path, ...handlers) => routes.push({ method: 'DELETE', path, handler: handlers[handlers.length - 1] }),
                use: (fn) => { if (typeof fn === 'function') middlewares.push(fn); },
                listen: () => {},
            };
            app.route = () => app;
            return app;
        };
        mockExpress.json = () => (req, res, next) => next();
        mockExpress.urlencoded = () => (req, res, next) => next();

        const mockRequire = (mod) => {
            if (mod === 'express') return mockExpress;
            return {};
        };

        const fn = new Function('require', 'console', code);
        const mockConsole = { log: (...a) => logs.push(a.map(String).join(' ')), warn: (...a) => logs.push(a.map(String).join(' ')), error: (...a) => logs.push(a.map(String).join(' ')) };
        fn(mockRequire, mockConsole);

        if (routes.length === 0 && middlewares.length === 0) {
            return 'No routes or middleware detected.\nDefine routes with app.get(), app.post(), etc.';
        }

        let output = `Detected ${routes.length} route(s):\n`;
        for (const route of routes) {
            const paramMatch = route.path.match(/:(\w+)/g);
            const params = {};
            if (paramMatch) paramMatch.forEach(p => { params[p.slice(1)] = '1'; });

            let body = null;
            const mockReq = { params, query: { a: '3', b: '5' }, body: { message: 'hi' }, method: route.method, url: route.path };
            let response = '';
            let statusCode = 200;
            const mockRes = {
                send: (d) => { response = typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d); return mockRes; },
                json: (d) => { response = JSON.stringify(d, null, 2); return mockRes; },
                status: (c) => { statusCode = c; return mockRes; },
                end: () => { return mockRes; },
            };

            // Run middleware first
            for (const mw of middlewares) {
                try { mw(mockReq, mockRes, () => {}); } catch (e) { /* skip */ }
            }

            try {
                route.handler(mockReq, mockRes);
            } catch (e) {
                response = `Error: ${e.message}`;
            }

            output += `\n─── ${route.method} ${route.path} ───\n`;
            output += `Status: ${statusCode}\n`;
            output += `Response:\n${response || '(empty)'}\n`;
        }

        if (logs.length > 0) {
            output += `\n─── Console Output ───\n${logs.join('\n')}\n`;
        }

        return output;
    } catch (e) {
        return `Syntax Error: ${e.message}`;
    }
}

function runSpringBoot(code) {
    const lines = code.split('\n');
    const endpoints = [];
    let classMapping = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const rm = line.match(/@RequestMapping\(["'](.+?)["']\)/);
        if (rm) classMapping = rm[1];

        const gm = line.match(/@GetMapping\(["'](.+?)["']\)/);
        if (gm) endpoints.push({ method: 'GET', path: classMapping + gm[1] });

        const pm = line.match(/@PostMapping\(["'](.+?)["']\)/);
        if (pm) endpoints.push({ method: 'POST', path: classMapping + pm[1] });

        const dm = line.match(/@DeleteMapping\(["'](.+?)["']\)/);
        if (dm) endpoints.push({ method: 'DELETE', path: classMapping + dm[1] });

        const pum = line.match(/@PutMapping\(["'](.+?)["']\)/);
        if (pum) endpoints.push({ method: 'PUT', path: classMapping + pum[1] });
    }

    // Extract return statements
    const returns = [...code.matchAll(/return\s+["'](.+?)["']/g)].map(m => m[1]);
    const returnObjs = [...code.matchAll(/return\s+(\{.+?\})/g)].map(m => m[1]);

    if (endpoints.length === 0) {
        return 'No endpoints detected.\n\nAdd @GetMapping("/path") or @PostMapping("/path") annotations above your methods.';
    }

    let output = `Detected ${endpoints.length} endpoint(s):\n`;
    endpoints.forEach((ep, i) => {
        output += `\n─── ${ep.method} ${ep.path} ───\n`;
        if (returns[i]) output += `Returns: "${returns[i]}"\n`;
        else if (returnObjs[i]) output += `Returns: ${returnObjs[i]}\n`;
        else output += `Returns: (could not detect)\n`;
    });

    const hasController = code.includes('@RestController');
    const hasRequestBody = code.includes('@RequestBody');
    const hasPathVar = code.includes('@PathVariable');
    const hasReqParam = code.includes('@RequestParam');

    output += '\n─── Annotations Used ───\n';
    if (hasController) output += '  @RestController\n';
    if (hasRequestBody) output += '  @RequestBody\n';
    if (hasPathVar) output += '  @PathVariable\n';
    if (hasReqParam) output += '  @RequestParam\n';
    if (classMapping) output += `  @RequestMapping("${classMapping}")\n`;

    return output;
}

function CodeOutputPanel({ language }) {
    const { sandpack } = useSandpack();
    const [output, setOutput] = useState('Press Run to execute your code.');
    const [hasRun, setHasRun] = useState(false);
    const lang = language.toLowerCase();

    const handleRun = () => {
        const code = sandpack.files[sandpack.activeFile]?.code || '';
        if (!code.trim()) { setOutput('Error: No code to run.'); setHasRun(true); return; }
        try {
            let result;
            if (lang === 'sql') result = runSQL(code);
            else if (lang === 'node.js') result = runNodeJS(code);
            else if (lang === 'spring boot') result = runSpringBoot(code);
            else result = 'Execution not supported for this language.';
            setOutput(result);
        } catch (e) {
            setOutput(`Runtime Error: ${e.message}`);
        }
        setHasRun(true);
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${hasRun ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Output</span>
                </div>
                <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1 rounded transition-all active:scale-95"
                >
                    <span>&#9654;</span> Run
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <pre className="font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{output}</pre>
            </div>
        </div>
    );
}

function SubmitPanel({ challenge, nextChallengeId }) {
    const navigate = useNavigate();
    const { sandpack } = useSandpack();
    const [result, setResult] = useState(null);
    const [feedback, setFeedback] = useState('');
    const previewHtml = useRef('');

    useEffect(() => {
        const handler = (e) => {
            if (e.data?.type === '__devwar__') {
                previewHtml.current = e.data.html || '';
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const isReact = challenge.language.toLowerCase() === 'react';

    const handleSubmit = () => {
        const expected = challenge.expectedOutput;
        let passed = false;

        if (isReact) {
            const html = previewHtml.current;
            const norm = (s) => s.replace(/'/g, '"');
            passed = html && norm(html).includes(norm(expected));
            if (!passed) {
                setFeedback(html
                    ? `Your rendered output:\n${html}\n\nExpected to contain:\n${expected}`
                    : 'No output detected. Make sure your component renders correctly.'
                );
            }
        } else {
            const code = sandpack.files[sandpack.activeFile]?.code || '';
            const normCode = code.replace(/\s+/g, ' ').trim().toLowerCase();
            const normExpected = expected.replace(/\s+/g, ' ').trim().toLowerCase();
            passed = normCode.includes(normExpected);
            if (!passed) {
                setFeedback(`Your code should contain a pattern like:\n${expected}\n\nCheck your syntax and try again.`);
            }
        }

        if (passed) {
            setResult('pass');
            setFeedback('');
            const target = nextChallengeId ? `/lesson/${nextChallengeId}` : '/learn';
            setTimeout(() => navigate(target), 2500);
        } else {
            setResult('fail');
        }
    };

    const handleReset = () => {
        setResult(null);
        setFeedback('');
        sandpack.resetAllFiles();
    };

    return (
        <>
            {result === 'pass' ? (
                <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 font-bold animate-pulse">
                    <span>🎉</span> {nextChallengeId ? 'Completed! Next challenge loading...' : 'Challenge Completed! Returning...'}
                </div>
            ) : (
                <>
                    {result === 'fail' && (
                        <div className="mb-4">
                            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg font-bold mb-2 flex items-center gap-2">
                                <span>❌</span> Incorrect — check the output below
                            </div>
                            {feedback && (
                                <pre className="bg-slate-800 border border-slate-600 text-slate-300 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                                    {feedback}
                                </pre>
                            )}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            Submit Solution
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 px-4 rounded-lg transition-all active:scale-[0.98]"
                        >
                            Reset
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

export default function LessonPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nextChallengeId, setNextChallengeId] = useState(null);

    useEffect(() => {
        setLoading(true);
        setChallenge(null);
        setNextChallengeId(null);

        api.get(`/challenges/${id}`)
            .then(res => {
                setChallenge(res.data);
                return api.get(`/challenges/track/${res.data.language}`);
            })
            .then(res => {
                const challenges = res.data;
                const idx = challenges.findIndex(c => c.id === parseInt(id));
                if (idx >= 0 && idx < challenges.length - 1) {
                    setNextChallengeId(challenges[idx + 1].id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="text-center mt-20 text-slate-400 font-mono animate-pulse">Loading Environment...</div>;
    if (!challenge) return <div className="text-center mt-20 text-red-400">Challenge Not Found!</div>;

    const isReact = challenge.language.toLowerCase() === 'react';
    const lang = challenge.language.toLowerCase();

    const getCodeFile = () => {
        if (lang === 'sql') return '/code.sql';
        if (lang === 'spring boot') return '/code.java';
        if (lang === 'node.js') return '/code.js';
        return '/code.txt';
    };

    const codeFile = getCodeFile();

    return (
        <SandpackProvider
            key={id}
            template={isReact ? 'react' : 'static'}
            theme="dark"
            files={isReact
                ? { '/App.js': challenge.starterCode, '/index.js': { code: REACT_VALIDATION_ENTRY, hidden: true } }
                : { '/index.html': { code: '', hidden: true }, [codeFile]: challenge.starterCode }
            }
            options={isReact ? {} : { activeFile: codeFile }}
        >
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

                    {challenge.hint && (
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Hint:</h4>
                            <p className="text-yellow-400 text-sm leading-relaxed">{challenge.hint}</p>
                        </div>
                    )}

                    <SubmitPanel challenge={challenge} nextChallengeId={nextChallengeId} />
                </div>

                {/* Right panel - IDE */}
                <div className="w-full md:w-2/3 h-full">
                    {isReact ? (
                        <SandpackLayout style={{ height: '100%' }}>
                            <SandpackCodeEditor showLineNumbers style={{ height: '100%' }} />
                            <SandpackPreview style={{ height: '100%' }} />
                        </SandpackLayout>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 min-h-0">
                                <SandpackCodeEditor
                                    showLineNumbers
                                    style={{ height: '100%' }}
                                    showTabs={false}
                                />
                            </div>
                            <div className="h-[35%] border-t border-slate-700">
                                <CodeOutputPanel language={challenge.language} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SandpackProvider>
    );
}
