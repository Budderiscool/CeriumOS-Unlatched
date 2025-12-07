
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface AppDef {
  id: string;
  name: string;
  icon: LucideIcon;
  component: ComponentType<any>;
  isSystemApp?: boolean;
  singleInstance?: boolean;
}

export interface FileNode {
  name: string;
  icon?: LucideIcon;
  children?: FileNode[];
  content?: string;
}

    