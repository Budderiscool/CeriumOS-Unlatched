
"use client";

import React, { useState } from 'react';
import { useFileSystem } from '@/lib/filesystem';
import type { FileNode } from '@/lib/types';
import { Folder, FileText, ArrowLeft, RefreshCw, Home, FolderPlus, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function FileManager() {
  const { readFile, createFile, createFolder } = useFileSystem();
  const [currentPath, setCurrentPath] = useState('/');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');

  const currentNode = readFile(currentPath);

  const navigateTo = (folderName: string) => {
    setCurrentPath(prev => (prev === '/' ? `/${folderName}` : `${prev}/${folderName}`));
  };

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    setCurrentPath(`/${parts.join('/')}`);
  };

  const handleCreateFolder = () => {
    if (newFolderName) {
      createFolder(currentPath, newFolderName);
      setNewFolderName('');
    }
  };

  const handleCreateFile = () => {
    if (newFileName) {
      createFile(currentPath, newFileName);
      setNewFileName('');
    }
  };


  const renderIcon = (node: FileNode) => {
    const Icon = node.icon || FileText;
    return <Icon className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <header className="p-2 border-b flex items-center gap-2 bg-secondary/30">
        <Button variant="ghost" size="icon" onClick={navigateUp} disabled={currentPath === '/'}><ArrowLeft className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => setCurrentPath('/')}><Home className="h-4 w-4" /></Button>
        <div className="flex-grow px-2 py-1 bg-muted rounded-md text-sm">{currentPath}</div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon"><FolderPlus className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Folder</AlertDialogTitle>
              <AlertDialogDescription>
                <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" autoFocus />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateFolder}>Create</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon"><FilePlus className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New File</AlertDialogTitle>
              <AlertDialogDescription>
                <Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="File name" autoFocus />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateFile}>Create</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
          {currentNode && currentNode.children?.map(node => (
            <button
              key={node.name}
              onDoubleClick={() => node.children && navigateTo(node.name)}
              className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-primary/10"
            >
              {renderIcon(node)}
              <span className="text-foreground text-sm text-center truncate w-full">{node.name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

    