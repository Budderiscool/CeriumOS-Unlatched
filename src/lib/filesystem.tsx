
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FileNode } from './types';
import { Folder, FileText, Image as ImageIcon } from 'lucide-react';

// We need to give the icons a displayName so we can look them up later.
Folder.displayName = 'Folder';
FileText.displayName = 'FileText';
ImageIcon.displayName = 'Image';


const defaultFiles: FileNode = {
  name: 'root',
  children: [
    { 
      name: 'Documents', 
      icon: Folder,
      children: [
        { name: 'resume.txt', icon: FileText, content: 'This is my resume.'},
        { name: 'project_ideas.txt', icon: FileText, content: 'Idea 1: A cool OS in the browser.'},
      ]
    },
    { 
      name: 'Pictures', 
      icon: Folder,
      children: [
         { name: 'photo.jpg', icon: ImageIcon },
      ]
    },
    { name: 'README.md', icon: FileText, content: '# Welcome to CeriumOS!' },
  ],
};

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

interface FileSystemContextType {
  files: FileNode;
  readFile: (path: string) => FileNode | null;
  writeFile: (path: string, content: string) => void;
  createFile: (path: string, fileName: string, content?: string) => void;
  createFolder: (path: string, folderName: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export const FileSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [files, setFiles] = usePersistentState<FileNode>('filesystem', defaultFiles);

  const findNode = (path: string): { parent: FileNode | null; node: FileNode | null; nodeName: string } => {
    const parts = path.split('/').filter(p => p);
    let currentNode: FileNode = files;
    let parentNode: FileNode | null = null;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!currentNode.children) {
            return { parent: null, node: null, nodeName: part };
        }
        const foundNode = currentNode.children.find(child => child.name === part);
        if (!foundNode) {
            return { parent: currentNode, node: null, nodeName: part };
        }
        parentNode = currentNode;
        currentNode = foundNode;
    }

    return { parent: parentNode, node: currentNode, nodeName: parts[parts.length - 1] || 'root' };
  };

  const readFile = (path: string): FileNode | null => {
    const { node } = findNode(path);
    return node;
  };

  const writeFile = (path: string, content: string) => {
    setFiles(prevFiles => {
      const newFiles = JSON.parse(JSON.stringify(prevFiles));
      const parts = path.split('/').filter(p => p);
      let currentNode = newFiles;

      for (let i = 0; i < parts.length - 1; i++) {
        currentNode = currentNode.children?.find(c => c.name === parts[i]);
        if (!currentNode) return prevFiles; // Path not found
      }
      
      const file = currentNode.children?.find(c => c.name === parts[parts.length - 1]);
      if (file) {
        file.content = content;
      }
      
      return newFiles;
    });
  };

  const createFile = (path: string, fileName: string, content: string = '') => {
      setFiles(prevFiles => {
        const newFiles = JSON.parse(JSON.stringify(prevFiles));
        const { node: parentNode } = findNode(path);

        if (parentNode && parentNode.children) {
            if (!parentNode.children.find(c => c.name === fileName)) {
                parentNode.children.push({ name: fileName, icon: FileText, content });
            }
        }
        return newFiles;
      });
  };
  
  const createFolder = (path: string, folderName: string) => {
       setFiles(prevFiles => {
        const newFiles = JSON.parse(JSON.stringify(prevFiles));
        const { node: parentNode } = findNode(path);

        if (parentNode && parentNode.children) {
            if (!parentNode.children.find(c => c.name === folderName)) {
                parentNode.children.push({ name: folderName, icon: Folder, children: [] });
            }
        }
        return newFiles;
      });
  };

  return (
    <FileSystemContext.Provider value={{ files, readFile, writeFile, createFile, createFolder }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
