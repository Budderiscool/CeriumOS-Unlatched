
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { apps } from '@/lib/apps';
import type { AppDef } from '@/lib/types';
import Taskbar from '@/components/os/taskbar';
import DesktopIcon from '@/components/os/desktop-icon';
import Window from '@/components/os/window';
import { FileSystemProvider } from '@/lib/filesystem';

interface AppInstance {
  app: AppDef;
  instanceId: number;
  zIndex: number;
  position: { x: number; y: number };
  isMinimized: boolean;
}

interface IconPosition {
  [key: string]: { x: number; y: number };
}

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        setState(JSON.parse(storedValue));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, state, isInitialized]);

  return [state, setState];
};

export default function DesktopPage() {
  const [openApps, setOpenApps] = usePersistentState<AppInstance[]>('openApps', []);
  const [activeInstanceId, setActiveInstanceId] = usePersistentState<number | null>('activeInstanceId', null);
  const [iconPositions, setIconPositions] = usePersistentState<IconPosition>('iconPositions', {});
  
  const [isClient, setIsClient] = useState(false);

  const nextInstanceId = useRef(0);
  const nextZIndex = useRef(10);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedNextInstanceId = window.localStorage.getItem('nextInstanceId');
      const savedNextZIndex = window.localStorage.getItem('nextZIndex');
      nextInstanceId.current = savedNextInstanceId ? JSON.parse(savedNextInstanceId) : 0;
      nextZIndex.current = savedNextZIndex ? JSON.parse(savedNextZIndex) : 10;
    } catch (error) {
      console.error('Error initializing refs from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
          window.localStorage.setItem('nextInstanceId', JSON.stringify(nextInstanceId.current));
          window.localStorage.setItem('nextZIndex', JSON.stringify(nextZIndex.current));
      } catch (error) {
          console.error('Error saving refs to localStorage:', error);
      }
    }
  }, [openApps, isClient]);

  const openApp = useCallback((app: AppDef, input?: any) => {
    const existingInstance = openApps.find(a => a.app.id === app.id && a.app.singleInstance);
    if (existingInstance) {
        focusApp(existingInstance.instanceId);
        return;
    }

    const newInstanceId = nextInstanceId.current++;
    const newZIndex = nextZIndex.current++;
    
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
  }, [openApps, setOpenApps, setActiveInstanceId]);

  const closeApp = useCallback((instanceId: number) => {
    setOpenApps(prev => {
        const newOpenApps = prev.filter(a => a.instanceId !== instanceId);
        if (activeInstanceId === instanceId) {
            const remainingApps = newOpenApps.filter(a => !a.isMinimized);
            if (remainingApps.length > 0) {
                const topApp = remainingApps.sort((a,b) => b.zIndex - a.zIndex)[0];
                setActiveInstanceId(topApp.instanceId);
            } else {
                setActiveInstanceId(null);
            }
        }
        return newOpenApps;
    });
  }, [activeInstanceId, setOpenApps, setActiveInstanceId]);


  const focusApp = useCallback((instanceId: number) => {
    const targetApp = openApps.find(a => a.instanceId === instanceId);
    if (!targetApp) return;

    if (activeInstanceId === instanceId && !targetApp.isMinimized) return;
    
    const newZIndex = nextZIndex.current++;
    setOpenApps(prev =>
      prev.map(a =>
        a.instanceId === instanceId ? { ...a, zIndex: newZIndex, isMinimized: false } : a
      )
    );
    setActiveInstanceId(instanceId);
  }, [activeInstanceId, openApps, setOpenApps, setActiveInstanceId]);

  const toggleMinimize = useCallback((instanceId: number) => {
    let becomingActiveId: number | null = null;
    const targetApp = openApps.find(a => a.instanceId === instanceId);
    
    if (!targetApp) return;

    const isNowMinimized = !targetApp.isMinimized;

    if (isNowMinimized && activeInstanceId === instanceId) {
        const otherApps = openApps.filter(app => app.instanceId !== instanceId && !app.isMinimized);
        if (otherApps.length > 0) {
            becomingActiveId = otherApps.sort((b,c) => c.zIndex - b.zIndex)[0].instanceId;
        } else {
            becomingActiveId = null;
        }
        setActiveInstanceId(becomingActiveId);
    } else if (!isNowMinimized) {
        focusApp(instanceId);
    }

    setOpenApps(prev => prev.map(a => 
      a.instanceId === instanceId ? { ...a, isMinimized: isNowMinimized } : a
    ));

  }, [activeInstanceId, openApps, setOpenApps, focusApp, setActiveInstanceId]);

  const updatePosition = useCallback((instanceId: number, newPosition: { x: number; y: number }) => {
    setOpenApps(prev =>
      prev.map(a =>
        a.instanceId === instanceId ? { ...a, position: newPosition } : a
      )
    );
  }, [setOpenApps]);

  const updateIconPosition = useCallback((appId: string, newPosition: { x: number; y: number }) => {
      setIconPositions(prev => ({...prev, [appId]: newPosition}));
  }, [setIconPositions]);


  return (
    <FileSystemProvider>
      <main className="h-screen w-screen overflow-hidden bg-background font-sans flex flex-col">
        <div className="flex-grow relative" id="desktop">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070"
            alt="Lively background"
            fill={true}
            objectFit="cover"
            quality={80}
            className="absolute inset-0 z-0 opacity-70"
            data-ai-hint="landscape"
            priority
          />

          <div className="absolute inset-0 z-10">
            {isClient && apps.map((app, index) => (
              <DesktopIcon 
                key={app.id} 
                app={app} 
                onOpen={openApp} 
                position={iconPositions[app.id] || { x: 16, y: 16 + index * 100 }}
                onPositionChange={updateIconPosition}
              />
            ))}
          </div>

          <div className="relative z-20">
            {isClient && openApps.map(instance => 
              !instance.isMinimized && (
                <Window
                  key={instance.instanceId}
                  appInstance={instance}
                  isActive={instance.instanceId === activeInstanceId}
                  onClose={closeApp}
                  onFocus={focusApp}
                  onMinimize={toggleMinimize}
                  onPositionChange={updatePosition}
                  openApp={openApp}
                />
              )
            )}
          </div>
        </div>
        <Taskbar 
          openApps={openApps} 
          activeInstanceId={activeInstanceId}
          onAppIconClick={focusApp}
          onCloseApp={closeApp}
          onAppLauncherClick={() => openApp(apps.find(app => app.id === 'launcher')!)}
        />
      </main>
    </FileSystemProvider>
  );
}

    
