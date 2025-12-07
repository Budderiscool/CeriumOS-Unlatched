"use client";

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCw, Home } from 'lucide-react';

export default function Browser() {
  const [url, setUrl] = useState('https://www.google.com/webhp?igu=1');
  const [iframeSrc, setIframeSrc] = useState('/api/proxy?url=https%3A%2F%2Fwww.google.com%2Fwebhp%3Figu%3D1');
  const [inputValue, setInputValue] = useState('https://www.google.com');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let finalUrl = inputValue;
    if (!finalUrl.startsWith('http')) {
        finalUrl = `https://${finalUrl}`;
    }
    setUrl(finalUrl);
    setIframeSrc(`/api/proxy?url=${encodeURIComponent(finalUrl)}`);
  };
  
  const refreshIframe = () => {
    const currentSrc = iframeSrc;
    // Force reload by setting to about:blank and then back
    setIframeSrc('about:blank');
    setTimeout(() => setIframeSrc(currentSrc), 10);
  }

  const goHome = () => {
    const homeUrl = 'https://www.google.com/webhp?igu=1';
    setInputValue('https://www.google.com');
    setUrl(homeUrl);
    setIframeSrc(`/api/proxy?url=${encodeURIComponent(homeUrl)}`);
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-2 border-b flex items-center gap-2 bg-secondary/30">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goHome}><Home className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshIframe}><RotateCw className="h-4 w-4" /></Button>
        <form onSubmit={handleSubmit} className="flex-grow flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a URL"
            className="h-8"
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <div className="flex-grow bg-muted/30">
        <iframe
          key={iframeSrc} // Re-mounts iframe on src change
          src={iframeSrc}
          className="w-full h-full border-0"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="CeriumOS Browser"
        />
      </div>
    </div>
  );
}
