
"use client";

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minus, Square } from 'lucide-react';
import { AppDef } from '@/lib/types';
import { cn } from '@/lib/utils';
import AppLauncher from './app-launcher';
import { apps as appDefs } from '@/lib/apps';

interface AppInstance {
  app: AppDef;
  instanceId: number;
  zIndex: number;
  position: { x: number; y: number };
}

interface WindowProps {
  appInstance: AppInstance;
  isActive: boolean;
  onClose: (instanceId: number) => void;
  onFocus: (instanceId: number) => void;
  onMinimize: (instanceId: number) => void;
  onPositionChange: (instanceId: number, newPosition: { x: number; y: number }) => void;
  openApp: (app: AppDef) => void;
}

export default function Window({ appInstance, isActive, onClose, onFocus, onMinimize, onPositionChange, openApp }: WindowProps) {
  const { app, instanceId, zIndex, position } = appInstance;
  const isLauncher = app.id === 'launcher';

  // Find the original app definition to get the component, not from the persisted state
  const originalAppDef = appDefs.find(a => a.id === app.id);
  const Icon = originalAppDef ? originalAppDef.icon : () => null;
  const AppContent = originalAppDef ? originalAppDef.component : () => null;

  const nodeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.window-controls')) return;
    
    e.preventDefault();
    onFocus(instanceId);
    isDraggingRef.current = true;
    
    dragStartPosRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    if (nodeRef.current) {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const bounds = desktop.getBoundingClientRect();
        let newX = e.clientX - dragStartPosRef.current.x;
        let newY = e.clientY - dragStartPosRef.current.y;

        const headerHeight = headerRef.current?.offsetHeight || 40;
        newX = Math.max(0, Math.min(newX, bounds.width - nodeRef.current.offsetWidth));
        newY = Math.max(0, Math.min(newY, bounds.height - headerHeight));
        
        nodeRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const desktop = document.getElementById('desktop');
    if (!desktop) return;

    const bounds = desktop.getBoundingClientRect();
    let newX = e.clientX - dragStartPosRef.current.x;
    let newY = e.clientY - dragStartPosRef.current.y;
    
    if (nodeRef.current) {
      const headerHeight = headerRef.current?.offsetHeight || 40;
      newX = Math.max(0, Math.min(newX, bounds.width - nodeRef.current.offsetWidth));
      newY = Math.max(0, Math.min(newY, bounds.height - headerHeight));
    }

    onPositionChange(instanceId, { x: newX, y: newY });
  };

  return (
    <div
        ref={nodeRef}
        className={cn(
            "absolute top-0 left-0",
            isLauncher 
                ? "w-full h-full p-0" 
                : "min-w-[300px] min-h-[200px] w-[800px] h-[600px] max-w-[95vw] max-h-[calc(100vh-3.5rem-1rem)]",
        )}
        style={{ 
            zIndex: isLauncher ? 1000 : zIndex,
            transform: `translate(${position.x}px, ${position.y}px)`
        }}
        onMouseDownCapture={() => onFocus(instanceId)}
    >
        <Card className={cn(
            "w-full h-full flex flex-col shadow-2xl transition-all duration-100",
            isActive ? 'shadow-primary/30 border-primary/50' : 'shadow-black/20',
            isLauncher ? 'bg-background/80 backdrop-blur-md border-0 rounded-none' : 'bg-secondary/80 backdrop-blur-md'
        )}>
            {!isLauncher && (
                <CardHeader
                    ref={headerRef}
                    onMouseDown={handleMouseDown}
                    className={cn(
                        "flex flex-row items-center justify-between p-2 h-10 border-b cursor-grab active:cursor-grabbing",
                        isActive ? 'bg-accent/50' : 'bg-muted/50'
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{app.name}</span>
                    </div>
                    <div className="flex items-center gap-1 window-controls">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); onMinimize(instanceId)}}><Minus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Square className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground" onClick={(e) => {e.stopPropagation(); onClose(instanceId)}}><X className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-0 flex-grow relative overflow-hidden">
                {isLauncher ? (
                    <AppLauncher openApp={(app) => { openApp(app); onClose(instanceId); }} close={() => onClose(instanceId)} />
                ) : (
                    <AppContent />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
