
"use client";

import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCw, Home, X, Plus, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useFileSystem } from '@/lib/filesystem';

interface Tab {
  id: number;
  url: string;
  inputValue: string;
  history: string[];
  historyIndex: number;
}

const HOME_URL = 'https://www.google.com/webhp?igu=1';
const BLANK_PAGE = 'about:blank';

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: Date.now(), url: HOME_URL, inputValue: 'https://www.google.com', history: [HOME_URL], historyIndex: 0 }]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [useProxy, setUseProxy] = useState(true);
  const { writeFile } = useFileSystem();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const updateTab = (id: number, updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTab) {
      updateTab(activeTab.id, { inputValue: e.target.value });
    }
  };

  const navigateTo = (url: string, tabId: number) => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;
      
      const newHistory = tab.history.slice(0, tab.historyIndex + 1);
      newHistory.push(url);

      updateTab(tabId, { 
          url, 
          inputValue: url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0],
          history: newHistory,
          historyIndex: newHistory.length - 1
      });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTab) return;

    let finalUrl = activeTab.inputValue;
    if (!/^(https?:\/\/|about:)/.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
    }
    navigateTo(finalUrl, activeTab.id);
  };
  
  const refreshIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.src = getIframeSrc(activeTab?.url);
    }
  }

  const goHome = () => {
    if(activeTab) navigateTo(HOME_URL, activeTab.id);
  }

  const getIframeSrc = (url?: string) => {
    if (!url) return BLANK_PAGE;
    if (url === BLANK_PAGE) return BLANK_PAGE;
    return useProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url;
  }

  const addNewTab = () => {
    const newTabId = Date.now();
    const newTab: Tab = { id: newTabId, url: HOME_URL, inputValue: 'https://www.google.com', history: [HOME_URL], historyIndex: 0 };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  }

  const closeTab = (tabId: number) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    let newTabs = tabs.filter(t => t.id !== tabId);

    if (newTabs.length === 0) {
        const newTabId = Date.now();
        newTabs = [{ id: newTabId, url: HOME_URL, inputValue: 'https://www.google.com', history: [HOME_URL], historyIndex: 0 }];
        setActiveTabId(newTabId);
    } else if (activeTabId === tabId) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
    }
    setTabs(newTabs);
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex items-center border-b bg-secondary/30">
        <div className="flex-grow flex items-end h-full">
            <div className="flex-grow overflow-x-auto overflow-y-hidden whitespace-nowrap h-full">
                {tabs.map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={cn("inline-flex items-center h-full px-4 py-2 text-sm border-r",
                            activeTabId === tab.id ? "bg-background" : "bg-secondary/50 hover:bg-secondary/70"
                        )}>
                        <span>{tab.inputValue.split('/')[0]}</span>
                        <X className="w-4 h-4 ml-2" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}/>
                    </button>
                ))}
            </div>
            <Button variant="ghost" size="icon" className="m-1" onClick={addNewTab}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <div className="p-2 border-b flex items-center gap-2 bg-secondary/30">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goHome}><Home className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshIframe}><RotateCw className="h-4 w-4" /></Button>
        <form onSubmit={handleSubmit} className="flex-grow flex gap-2">
          <Input
            value={activeTab?.inputValue || ''}
            onChange={handleInputChange}
            placeholder="Enter a URL"
            className="h-8"
          />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
         <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-60" side="bottom" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Browser Settings</h4>
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="proxy-switch">Use Proxy</Label>
                        <Switch id="proxy-switch" checked={useProxy} onCheckedChange={setUseProxy} />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
      </div>
      <div className="flex-grow bg-muted/30">
        <iframe
          ref={iframeRef}
          key={activeTabId}
          src={getIframeSrc(activeTab?.url)}
          className="w-full h-full border-0"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="CeriumOS Browser"
        />
      </div>
    </div>
  );
}


    