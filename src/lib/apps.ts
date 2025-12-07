
import type { AppDef } from './types';
import { Globe, Terminal, Settings, LayoutGrid, Calculator, Folder, FileText } from 'lucide-react';
import Browser from '@/components/apps/browser';
import TerminalApp from '@/components/apps/terminal';
import SettingsApp from '@/components/apps/settings';
import CalculatorApp from '@/components/apps/calculator';
import AppLauncher from '@/components/os/app-launcher';
import FileManager from '@/components/apps/file-manager';
import Notepad from '@/components/apps/notepad';


export const apps: AppDef[] = [
  {
    id: 'browser',
    name: 'Browser',
    icon: Globe,
    component: Browser,
    singleInstance: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    component: TerminalApp,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    component: SettingsApp,
    singleInstance: true,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    component: CalculatorApp,
  },
  {
    id: 'files',
    name: 'File Explorer',
    icon: Folder,
    component: FileManager,
    singleInstance: true,
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: FileText,
    component: Notepad,
  },
  {
    id: 'launcher',
    name: 'App Launcher',
    icon: LayoutGrid,
    component: AppLauncher,
    isSystemApp: true,
    singleInstance: true,
  },
];

    