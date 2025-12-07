
"use client";

import React, { useRef } from 'react';
import type { AppDef } from '@/lib/types';

interface DesktopIconProps {
  app: AppDef;
  onOpen: (app: AppDef) => void;
  position: { x: number; y: number };
  onPositionChange: (appId: string, newPosition: { x: number; y: number }) => void;
}

export default function DesktopIcon({ app, onOpen, position, onPositionChange }: DesktopIconProps) {
  const nodeRef = useRef<HTMLButtonElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (app.isSystemApp) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
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
        // Check if cursor moved more than a few pixels to distinguish drag from click
        if (Math.abs(e.clientX - dragStartPosRef.current.x - position.x) > 5 || Math.abs(e.clientY - dragStartPosRef.current.y - position.y) > 5) {
             if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
        }

        const desktop = document.getElementById('desktop');
        if (!desktop) return;

        const bounds = desktop.getBoundingClientRect();
        let newX = e.clientX - dragStartPosRef.current.x;
        let newY = e.clientY - dragStartPosRef.current.y;

        newX = Math.max(0, Math.min(newX, bounds.width - nodeRef.current.offsetWidth));
        newY = Math.max(0, Math.min(newY, bounds.height - nodeRef.current.offsetHeight));

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
      newX = Math.max(0, Math.min(newX, bounds.width - nodeRef.current.offsetWidth));
      newY = Math.max(0, Math.min(newY, bounds.height - nodeRef.current.offsetHeight));
    }
    
    onPositionChange(app.id, { x: newX, y: newY });
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // This is a hacky way to distinguish single from double click.
      if (clickTimeoutRef.current) { // Double click
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
          onOpen(app);
      } else { // Single click
          clickTimeoutRef.current = setTimeout(() => {
              clickTimeoutRef.current = null;
              // Handle single click action if any, e.g. selection
          }, 250);
      }
  };

  return (
    <button
      ref={nodeRef}
      style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-1 w-[90px] h-[90px] rounded-lg hover:bg-primary/10 focus:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-150 cursor-grab active:cursor-grabbing"
    >
      <app.icon className="w-10 h-10 text-primary pointer-events-none" />
      <span className="text-white text-xs text-center truncate w-full pointer-events-none select-none [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">{app.name}</span>
    </button>
  );
}
