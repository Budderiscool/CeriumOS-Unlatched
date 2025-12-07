"use client";

import React, { useState, useCallback, useRef } from 'react';
import { apps } from '@/lib/apps';
import type { AppDef } from '@/lib/types';
import Taskbar from '@/components/os/taskbar';
import DesktopIcon from '@/components/os/desktop-icon';
import Window from '@/components/os/window';

interface AppInstance {
  app: AppDef;
  instanceId: number;
  zIndex: number;
  position: { x: number; y: number };
  isMinimized: boolean;
}

export default function DesktopPage() {
  const [openApps, setOpenApps] = useState<AppInstance[]>([]);
  const [activeInstanceId, setActiveInstanceId] = useState<number | null>(null);
  const nextInstanceId = useRef(0);
  const nextZIndex = useRef(10);

  const openApp = useCallback((app: AppDef) => {
    const newInstanceId = nextInstanceId.current++;
    const newZIndex = nextZIndex.current++;
    
    // Check if there's an already open instance to cascade from
    const lastOpenedApp = openApps.slice().reverse().find(a => a.app.id === app.id);
    const initialPosition = lastOpenedApp 
      ? { x: lastOpenedApp.position.x + 30, y: lastOpenedApp.position.y + 30 }
      : { x: 100 + Math.random() * 200, y: 100 + Math.random() * 100 };

    const newAppInstance: AppInstance = {
      app,
      instanceId: newInstanceId,
      zIndex: newZIndex,
      position: initialPosition,
      isMinimized: false,
    };

    setOpenApps(prev => [...prev, newAppInstance]);
    setActiveInstanceId(newInstanceId);
  }, [openApps]);

  const closeApp = useCallback((instanceId: number) => {
    setOpenApps(prev => prev.filter(a => a.instanceId !== instanceId));
    if (activeInstanceId === instanceId) {
      setActiveInstanceId(null);
    }
  }, [activeInstanceId]);

  const focusApp = useCallback((instanceId: number) => {
    if (activeInstanceId === instanceId) return;

    const newZIndex = nextZIndex.current++;
    setOpenApps(prev =>
      prev.map(a =>
        a.instanceId === instanceId ? { ...a, zIndex: newZIndex, isMinimized: false } : a
      )
    );
    setActiveInstanceId(instanceId);
  }, [activeInstanceId]);

  const toggleMinimize = useCallback((instanceId: number) => {
    setOpenApps(prev => prev.map(a => {
      if (a.instanceId === instanceId) {
        const isNowMinimized = !a.isMinimized;
        if (!isNowMinimized) {
          // If un-minimizing, bring to front
          focusApp(instanceId);
        } else if (activeInstanceId === instanceId) {
          // If minimizing the active window, deactivate it
          setActiveInstanceId(null);
        }
        return { ...a, isMinimized: isNowMinimized };
      }
      return a;
    }));
  }, [activeInstanceId, focusApp]);

  const updatePosition = useCallback((instanceId: number, newPosition: { x: number; y: number }) => {
    setOpenApps(prev =>
      prev.map(a =>
        a.instanceId === instanceId ? { ...a, position: newPosition } : a
      )
    );
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-background font-sans flex flex-col">
      <div className="flex-grow relative">
        <div className="absolute inset-0 p-4 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] auto-rows-min gap-4">
          {apps.map(app => (
            <DesktopIcon key={app.id} app={app} onOpen={openApp} />
          ))}
        </div>

        {openApps.map(instance => 
          !instance.isMinimized && (
            <Window
              key={instance.instanceId}
              appInstance={instance}
              isActive={instance.instanceId === activeInstanceId}
              onClose={closeApp}
              onFocus={focusApp}
              onMinimize={toggleMinimize}
              onPositionChange={updatePosition}
            />
          )
        )}
      </div>
      <Taskbar 
        openApps={openApps} 
        activeInstanceId={activeInstanceId}
        onAppIconClick={focusApp}
        onAppLauncherClick={() => openApp(apps.find(app => app.id === 'launcher')!)}
      />
    </main>
  );
}
