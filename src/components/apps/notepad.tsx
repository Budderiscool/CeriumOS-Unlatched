
"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useFileSystem } from '@/lib/filesystem';

interface NotepadProps {
  filePath?: string;
}

export default function Notepad({ filePath = '/Documents/new_document.txt' }: NotepadProps) {
  const { readFile, writeFile, createFile } = useFileSystem();
  const [content, setContent] = useState('');
  const [currentFile, setCurrentFile] = useState(filePath);

  useEffect(() => {
    let file = readFile(currentFile);
    if (!file) {
      const fileName = currentFile.split('/').pop() || 'new_document.txt';
      const dirPath = currentFile.substring(0, currentFile.lastIndexOf('/')) || '/';
      createFile(dirPath, fileName, '');
      file = readFile(currentFile);
    }
    
    if (file && typeof file.content === 'string') {
      setContent(file.content);
    }
  }, [currentFile, readFile, createFile]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  // Basic autosave
  useEffect(() => {
    const handler = setTimeout(() => {
      writeFile(currentFile, content);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [content, currentFile, writeFile]);


  return (
    <div className="w-full h-full flex flex-col bg-background">
      <Textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing..."
        className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0"
      />
    </div>
  );
}

    