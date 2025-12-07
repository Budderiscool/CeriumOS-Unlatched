"use client";

import type { AppDef } from '@/lib/types';

interface DesktopIconProps {
  app: AppDef;
  onOpen: (app: AppDef) => void;
}

export default function DesktopIcon({ app, onOpen }: DesktopIconProps) {
  if (app.isSystemApp) return null;

  return (
    <button
      onClick={() => onOpen(app)}
      onDoubleClick={() => onOpen(app)}
      className="flex flex-col items-center justify-center gap-2 w-[90px] h-[90px] rounded-lg hover:bg-primary/10 focus:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-150"
    >
      <app.icon className="w-10 h-10 text-primary" />
      <span className="text-foreground text-xs text-center truncate w-full">{app.name}</span>
    </button>
  );
}
