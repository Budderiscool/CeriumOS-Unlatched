import type { AppDef } from './types';
import { Globe, Terminal, Settings, LayoutGrid } from 'lucide-react';
import Browser from '@/components/apps/browser';
import TerminalApp from '@/components/apps/terminal';
import SettingsApp from '@/components/apps/settings';
import AppLauncher from '@/components/os/app-launcher';

export const apps: AppDef[] = [
  {
    id: 'browser',
    name: 'Browser',
    icon: Globe,
    component: Browser,
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
  },
  {
    id: 'launcher',
    name: 'App Launcher',
    icon: LayoutGrid,
    component: AppLauncher,
    isSystemApp: true,
  },
];
