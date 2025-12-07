"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minus, Square } from 'lucide-react';
import { AppDef } from '@/lib/types';
import { cn } from '@/lib/utils';
import AppLauncher from './app-launcher';

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
}

export default function Window({ appInstance, isActive, onClose, onFocus, onMinimize, onPositionChange }: WindowProps) {
  const { app, instanceId, zIndex, position } = appInstance;
  const isLauncher = app.id === 'launcher';

  const nodeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse button, and not on the window controls
    if (e.button !== 0 || (e.target as HTMLElement).closest('.window-controls')) return;
    
    e.preventDefault();
    onFocus(instanceId);
    isDraggingRef.current = true;
    
    if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        dragStartPosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !nodeRef.current) return;
    e.preventDefault();

    const newX = e.clientX - dragStartPosRef.current.x;
    const newY = e.clientY - dragStartPosRef.current.y;
    nodeRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDraggingRef.current || !nodeRef.current) return;
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    const newX = e.clientX - dragStartPosRef.current.x;
    const newY = e.clientY - dragStartPosRef.current.y;
    onPositionChange(instanceId, { x: newX, y: newY });
  };

  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
  }, [position]);

  const AppContent = app.component;

  return (
    <div
        ref={nodeRef}
        className={cn(
            "absolute top-0 left-0",
            isLauncher 
                ? "w-full h-full p-0" 
                : "min-w-[300px] min-h-[200px] w-[800px] h-[600px] max-w-[95vw] max-h-[85vh]",
            "transition-all duration-200 ease-in-out"
        )}
        style={{ zIndex: isLauncher ? 1000 : zIndex }}
        onClick={() => onFocus(instanceId)}
    >
        <Card className={cn(
            "w-full h-full flex flex-col shadow-2xl transition-all duration-300",
            isActive ? 'shadow-primary/30 border-primary/50' : 'shadow-black/20',
            isLauncher ? 'bg-background/80 backdrop-blur-md border-0 rounded-none' : 'bg-secondary/80 backdrop-blur-md'
        )}>
            {!isLauncher && (
                <CardHeader
                    ref={headerRef}
                    onMouseDown={handleMouseDown}
                    className={cn(
                        "flex flex-row items-center justify-between p-2 h-10 border-b cursor-move",
                        isActive ? 'bg-accent/50' : 'bg-muted/50'
                    )}
                >
                    <div className="flex items-center gap-2">
                        <app.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{app.name}</span>
                    </div>
                    <div className="flex items-center gap-1 window-controls">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMinimize(instanceId)}><Minus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Square className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground" onClick={() => onClose(instanceId)}><X className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-0 flex-grow relative overflow-hidden">
                {isLauncher ? (
                    <AppLauncher openApp={(app) => {onClose(instanceId); onFocus(app.id); }} close={() => onClose(instanceId)} />
                ) : (
                    <AppContent />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
