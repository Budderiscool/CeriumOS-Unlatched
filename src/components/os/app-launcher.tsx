
"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apps } from '@/lib/apps';
import type { AppDef } from '@/lib/types';
import { Search } from 'lucide-react';

interface AppLauncherProps {
  openApp: (app: AppDef) => void;
  close: () => void;
}

export default function AppLauncher({ openApp, close }: AppLauncherProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = useMemo(() => {
    return apps.filter(app => !app.isSystemApp && app.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleAppClick = (app: AppDef) => {
    openApp(app);
    close();
  };

  return (
    <div className="w-full h-full bg-transparent flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl h-full max-h-[600px] flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="pl-10 h-12 text-lg bg-secondary/80 border-0 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <ScrollArea className="flex-grow bg-secondary/50 rounded-lg">
          <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-6">
            {filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-primary/10 focus:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-150"
              >
                <app.icon className="w-12 h-12 text-primary" />
                <span className="text-foreground text-sm text-center truncate w-full">{app.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

    