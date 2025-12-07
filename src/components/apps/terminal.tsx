
"use client";

import React, { useEffect, useState, useRef, KeyboardEvent } from "react";
import { apps } from "@/lib/apps";
import { cn } from "@/lib/utils";
import type { AppDef } from "@/lib/types";

interface TerminalAppProps {
  openApp: (app: AppDef) => void;
}

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

export default function TerminalApp({ openApp }: TerminalAppProps) {
    const [history, setHistory] = useState<React.ReactNode[]>([
        <StaticLine key="0">Welcome to CeriumOS Terminal</StaticLine>,
        <StaticLine key="1">Type 'help' for a list of commands.</StaticLine>,
    ]);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    const handleCommand = (command: string) => {
        const newHistory: React.ReactNode[] = [...history, <div key={history.length}><span className="text-cyan-400">user@ceriumos:~$</span> {command}</div>];
        const [cmd, ...args] = command.toLowerCase().trim().split(' ');

        const appToOpen = apps.find(app => app.id === cmd);
        if (appToOpen) {
            openApp(appToOpen);
            newHistory.push(<StaticLine key={history.length + 1}>Opening {appToOpen.name}...</StaticLine>);
            setHistory(newHistory);
            return;
        }

        switch (cmd) {
            case 'help':
                newHistory.push(<StaticLine key={history.length + 1}>Commands: help, clear, date, about, neofetch, ls, echo, whoami, uname, ping, uptime, pwd, hostname, arch, free, exit, lorem, sudo, touch, mkdir, cat, rm, mv, cp, ps, kill, df, top, man, history, reboot, shutdown. You can also type an app id (e.g. 'browser') to open it.</StaticLine>);
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
                 newHistory.push(<StaticLine key={history.length + 1} className="flex gap-4">{apps.filter(a => !a.isSystemApp).map(a => a.id).join('   ')}</StaticLine>);
                break;
            case 'echo':
                newHistory.push(<StaticLine key={history.length + 1}>{args.join(' ')}</StaticLine>);
                break;
            case 'whoami':
                newHistory.push(<StaticLine key={history.length + 1}>user</StaticLine>);
                break;
            case 'uname':
                newHistory.push(<StaticLine key={history.length + 1}>Linux</StaticLine>);
                break;
            case 'ping':
                newHistory.push(<StaticLine key={history.length + 1}>PONG! {args[0] || 'localhost'} is alive.</StaticLine>);
                break;
            case 'uptime':
                newHistory.push(<StaticLine key={history.length + 1}>CeriumOS has been up for a very long time.</StaticLine>);
                break;
            case 'pwd':
                 newHistory.push(<StaticLine key={history.length + 1}>/home/user</StaticLine>);
                break;
            case 'hostname':
                newHistory.push(<StaticLine key={history.length + 1}>ceriumos-desktop</StaticLine>);
                break;
            case 'arch':
                newHistory.push(<StaticLine key={history.length + 1}>x86_64</StaticLine>);
                break;
            case 'free':
                newHistory.push(<StaticLine key={history.length + 1}>total: 8192MB, used: 2048MB, free: 6144MB</StaticLine>);
                break;
            case 'exit':
                newHistory.push(<StaticLine key={history.length + 1}>Cannot close terminal from here. Use the window controls.</StaticLine>);
                break;
            case 'lorem':
                newHistory.push(<StaticLine key={history.length + 1}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</StaticLine>);
                break;
             case 'sudo':
                newHistory.push(<StaticLine key={history.length + 1}>User is not in the sudoers file. This incident will be reported.</StaticLine>);
                break;
            case 'touch':
                newHistory.push(<StaticLine key={history.length + 1}>Creating file: {args[0] || 'new_file'}</StaticLine>);
                break;
            case 'mkdir':
                newHistory.push(<StaticLine key={history.length + 1}>Creating directory: {args[0] || 'new_directory'}</StaticLine>);
                break;
            case 'cat':
                newHistory.push(<StaticLine key={history.length + 1}>Displaying content of {args[0] || 'file.txt'}: ...</StaticLine>);
                break;
            case 'rm':
                newHistory.push(<StaticLine key={history.length + 1}>rm: permission denied for {args[0] || 'file.txt'}</StaticLine>);
                break;
            case 'mv':
                 newHistory.push(<StaticLine key={history.length + 1}>Moving {args[0] || 'file1'} to {args[1] || 'file2'}</StaticLine>);
                break;
            case 'cp':
                newHistory.push(<StaticLine key={history.length + 1}>Copying {args[0] || 'file1'} to {args[1] || 'file2'}</StaticLine>);
                break;
            case 'ps':
                newHistory.push(<StaticLine key={history.length + 1}>PID TTY TIME CMD<br />1 ? 00:00:01 systemd<br />42 ? 00:00:05 browser<br />101 ? 00:00:02 terminal</StaticLine>);
                break;
            case 'kill':
                newHistory.push(<StaticLine key={history.length + 1}>Cannot kill process {args[0] || '42'}.</StaticLine>);
                break;
            case 'df':
                newHistory.push(<StaticLine key={history.length + 1}>Filesystem 1K-blocks Used Available Use% Mounted on<br />tmpfs 819200 204800 614400 25% /</StaticLine>);
                break;
            case 'top':
                newHistory.push(<StaticLine key={history.length + 1}>Displaying top processes...</StaticLine>);
                break;
            case 'man':
                 newHistory.push(<StaticLine key={history.length + 1}>No manual entry for {args[0] || 'command'}</StaticLine>);
                break;
            case 'history':
                newHistory.push(<StaticLine key={history.length + 1}>{history.filter(h => typeof h === 'object' && h?.props?.children[1]).map((h, i) => `${i+1} ${h.props.children[1]}`).join('<br/>')}</StaticLine>);
                break;
            case 'reboot':
                 newHistory.push(<StaticLine key={history.length + 1}>Rebooting is not permitted.</StaticLine>);
                break;
            case 'shutdown':
                newHistory.push(<StaticLine key={history.length + 1}>Shutdown is not permitted.</StaticLine>);
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
            {history.map((line, index) => {
                if (typeof line === 'string') {
                    return <StaticLine key={index}><span dangerouslySetInnerHTML={{ __html: line }} /></StaticLine>;
                }
                 if (React.isValidElement(line) && line.props.children?.props?.dangerouslySetInnerHTML) {
                    return React.cloneElement(line as React.ReactElement, { key: index });
                }
                 if (React.isValidElement(line) && typeof line.props.children === 'string' && line.props.children.includes('<br />')) {
                    return <StaticLine key={index}><span dangerouslySetInnerHTML={{ __html: line.props.children }} /></StaticLine>;
                }
                return React.isValidElement(line) ? React.cloneElement(line as React.ReactElement, { key: index }) : null;
            })}
            <Prompt onSubmit={handleCommand} />
            <div ref={endOfHistoryRef} />
        </div>
    );
}
