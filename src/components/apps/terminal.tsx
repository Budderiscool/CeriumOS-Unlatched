"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";

const StaticLine = ({ children }: { children: React.ReactNode }) => (
    <p className="text-green-400">{children}</p>
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
            />
        </div>
    );
}

export default function TerminalApp() {
    const [history, setHistory] = useState<React.ReactNode[]>([
        <StaticLine key="0">Welcome to CeriumOS Terminal</StaticLine>,
        <StaticLine key="1">Type 'help' for a list of commands.</StaticLine>,
    ]);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    const handleCommand = (command: string) => {
        const newHistory = [...history, <div key={history.length}><span className="text-cyan-400">user@ceriumos:~$</span> {command}</div>];
        
        switch (command.toLowerCase().trim()) {
            case 'help':
                newHistory.push(<StaticLine key={history.length + 1}>Commands: help, clear, date, about</StaticLine>);
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
            default:
                if (command.trim() !== '') {
                   newHistory.push(<StaticLine key={history.length + 1}>Command not found: {command}</StaticLine>);
                }
                break;
        }
        setHistory(newHistory);
    };

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);
    
    return (
        <div className="w-full h-full bg-black text-sm font-mono p-4 overflow-y-auto" onClick={() => endOfHistoryRef.current?.querySelector('input')?.focus()}>
            {history}
            <Prompt onSubmit={handleCommand} />
            <div ref={endOfHistoryRef} />
        </div>
    );
}
