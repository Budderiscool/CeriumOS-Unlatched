
"use client";

import { LayoutGrid, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppDef } from '@/lib/types';
import { apps as appDefs } from '@/lib/apps';
import Clock from './clock';
import QuickSettings from './quick-settings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AppInstance {
  app: AppDef;
  instanceId: number;
  isMinimized: boolean;
}

interface TaskbarProps {
  openApps: AppInstance[];
  activeInstanceId: number | null;
  onAppIconClick: (instanceId: number) => void;
  onCloseApp: (instanceId: number) => void;
  onAppLauncherClick: () => void;
}

export default function Taskbar({ openApps, activeInstanceId, onAppIconClick, onCloseApp, onAppLauncherClick }: TaskbarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <footer className="w-full h-14 bg-background/70 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-2 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onAppLauncherClick}>
                <LayoutGrid className="h-5 w-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <p>App Launcher</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            {openApps.filter(a => !a.app.isSystemApp).map((instance) => {
              const appDef = appDefs.find(a => a.id === instance.app.id);
              if (!appDef) return null;
              const Icon = appDef.icon;

              return (
                <DropdownMenu key={instance.instanceId}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`relative h-10 w-10 transition-colors duration-200 ${
                            instance.instanceId === activeInstanceId && !instance.isMinimized ? 'bg-accent' : ''
                          }`}
                          onClick={() => onAppIconClick(instance.instanceId)}
                        >
                          <Icon className="h-6 w-6" />
                          {instance.instanceId === activeInstanceId && !instance.isMinimized && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-t-full"></span>
                          )}
                          {instance.isMinimized && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 border-b-2 border-primary"></span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>{instance.app.name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onCloseApp(instance.instanceId)}>
                      <X className="mr-2 h-4 w-4" />
                      <span>Close</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <QuickSettings />
          <Clock />
        </div>
      </footer>
    </TooltipProvider>
  );
}
