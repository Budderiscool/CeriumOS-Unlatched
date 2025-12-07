
"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { apps } from "@/lib/apps";

const StaticLine = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <p className={cn("text-green-400", className)}>{children}</p>
);

const Prompt = ({ onSubmit }: { onSubmit: (command: string) => void }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit(input);
            setInput('');
        }
    };
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex">
            <span className="text-cyan-400">user@ceriumos:~$</span>
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none text-green-400 focus:outline-none flex-1 ml-2"
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
            />
        </div>
    );
}

const Neofetch = () => (
    <div className="flex gap-4">
        <pre className="text-primary">
{`
   .---.
  /  .  \\
  |  :  |
  \\  '  /
   '---'
`}
        </pre>
        <div className="text-green-400">
            <p><span className="text-cyan-400">user</span>@<span className="text-cyan-400">ceriumos</span></p>
            <p>-------------</p>
            <p><span className="text-cyan-400">OS:</span> CeriumOS v1.0</p>
            <p><span className="text-cyan-400">Kernel:</span> Next.js</p>
            <p><span className="text-cyan-400">Uptime:</span> a few moments</p>
            <p><span className="text-cyan-400">Shell:</span> bash</p>
            <p><span className="text-cyan-400">Resolution:</span> your screen</p>
            <p><span className="text-cyan-400">DE:</span> CeriumDE</p>
            <p><span className="text-cyan-400">Terminal:</span> Cerium Terminal</p>
        </div>
    </div>
)

export default function TerminalApp() {
    const [history, setHistory] = useState<React.ReactNode[]>([
        <StaticLine key="0">Welcome to CeriumOS Terminal</StaticLine>,
        <StaticLine key="1">Type 'help' for a list of commands.</StaticLine>,
    ]);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    const handleCommand = (command: string) => {
        const newHistory: React.ReactNode[] = [...history, <div key={history.length}><span className="text-cyan-400">user@ceriumos:~$</span> {command}</div>];
        const [cmd, ...args] = command.toLowerCase().trim().split(' ');

        switch (cmd) {
            case 'help':
                newHistory.push(<StaticLine key={history.length + 1}>Commands: help, clear, date, about, neofetch, ls, echo</StaticLine>);
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'date':
                newHistory.push(<StaticLine key={history.length + 1}>{new Date().toString()}</StaticLine>);
                break;
            case 'about':
                newHistory.push(<StaticLine key={history.length + 1}>CeriumOS v1.0 - Minimalist Desktop Environment</StaticLine>);
                break;
            case 'neofetch':
                newHistory.push(<Neofetch key={history.length + 1} />);
                break;
            case 'ls':
                 newHistory.push(<StaticLine key={history.length + 1} className="flex gap-4">{apps.filter(a => !a.isSystemApp).map(a => a.name.toLowerCase().replace(' ', '_')).join('   ')}</StaticLine>);
                break;
            case 'echo':
                newHistory.push(<StaticLine key={history.length + 1}>{args.join(' ')}</StaticLine>);
                break;
            default:
                if (command.trim() !== '') {
                   newHistory.push(<StaticLine key={history.length + 1}>Command not found: {command}</StaticLine>);
                }
                break;
        }
        setHistory(newHistory);
    };

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: "auto" });
    }, [history]);
    
    return (
        <div className="w-full h-full bg-black text-sm font-mono p-4 overflow-y-auto" onClick={() => endOfHistoryRef.current?.querySelector('input')?.focus()}>
            {history}
            <Prompt onSubmit={handleCommand} />
            <div ref={endOfHistoryRef} />
        </div>
    );
}
