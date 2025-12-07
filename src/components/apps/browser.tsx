
"use client";

import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw, Home, X, Plus, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useFileSystem } from '@/lib/filesystem';

interface Tab {
  id: number;
  url: string;
  inputValue: string;
  title: string;
  history: string[];
  historyIndex: number;
}

const HOME_URL = 'https://www.google.com/webhp?igu=1';
const BLANK_PAGE = 'about:blank';
const getFaviconUrl = (url: string) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: Date.now(), url: HOME_URL, inputValue: 'https://www.google.com', title: 'Google', history: [HOME_URL], historyIndex: 0 }]);
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
      // Avoid pushing duplicates
      if (newHistory[newHistory.length - 1] !== url) {
        newHistory.push(url);
      }

      let newTitle = 'New Tab';
      try {
        newTitle = new URL(url).hostname.replace('www.', '');
      } catch (e) {
        // keep default for about:blank etc
      }

      updateTab(tabId, { 
          url, 
          inputValue: url,
          title: newTitle,
          history: newHistory,
          historyIndex: newHistory.length - 1
      });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTab) return;

    let finalUrl = activeTab.inputValue;
    if (!/^(https?:\/\/|about:)/.test(finalUrl)) {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
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

  const goBack = () => {
    if (activeTab && activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTab.id, { url: newUrl, inputValue: newUrl, historyIndex: newIndex });
    }
  }

  const goForward = () => {
    if (activeTab && activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const newUrl = activeTab.history[newIndex];
      updateTab(activeTab.id, { url: newUrl, inputValue: newUrl, historyIndex: newIndex });
    }
  }

  const getIframeSrc = (url?: string) => {
    if (!url) return BLANK_PAGE;
    if (url === BLANK_PAGE) return BLANK_PAGE;
    return useProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url;
  }

  const addNewTab = () => {
    const newTabId = Date.now();
    const newTab: Tab = { id: newTabId, url: HOME_URL, inputValue: 'https://www.google.com', title: 'Google', history: [HOME_URL], historyIndex: 0 };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  }

  const closeTab = (tabId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    let newTabs = tabs.filter(t => t.id !== tabId);

    if (newTabs.length === 0) {
        const newTabId = Date.now();
        newTabs = [{ id: newTabId, url: HOME_URL, inputValue: 'https://www.google.com', title: 'Google', history: [HOME_URL], historyIndex: 0 }];
        setActiveTabId(newTabId);
    } else if (activeTabId === tabId) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
    }
    setTabs(newTabs);
  }
  

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground">
      <div className="bg-secondary/30 border-b flex-shrink-0">
        {/* Tab Bar */}
        <div className="flex items-end h-10">
          <div className="flex-grow flex items-end h-full overflow-x-auto">
            {tabs.map(tab => (
              <div key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "flex items-center h-full max-w-[200px] px-3 gap-2 border-r relative group cursor-pointer",
                  activeTabId === tab.id ? "bg-background" : "bg-secondary/50 hover:bg-secondary/70"
                )}>
                  {tab.url !== BLANK_PAGE && (
                    <img src={getFaviconUrl(tab.url)} alt="" className="w-4 h-4 flex-shrink-0"/>
                  )}
                <span className="truncate text-sm">{tab.title}</span>
                <button onClick={(e) => closeTab(tab.id, e)} className="ml-auto p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-50 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-l" onClick={addNewTab}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Address Bar */}
        <div className="p-1.5 flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack} disabled={!activeTab || activeTab.historyIndex <= 0}><ArrowLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward} disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}><ArrowRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshIframe}><RotateCw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goHome}><Home className="h-4 w-4" /></Button>
          
          <form onSubmit={handleSubmit} className="flex-grow">
            <Input
              value={activeTab?.inputValue || ''}
              onChange={handleInputChange}
              placeholder="Search Google or enter an address"
              className="h-8"
            />
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
      </div>
      
      <div className="flex-grow bg-muted/30">
        <iframe
          ref={iframeRef}
          key={activeTabId}
          src={getIframeSrc(activeTab?.url)}
          className="w-full h-full border-0"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="CeriumOS Browser"
          onLoad={(e) => {
            const iframe = e.currentTarget;
            try {
              // This will fail for cross-origin iframes if proxy is off, that's expected.
              const title = iframe.contentDocument?.title;
              if (activeTab && title) {
                  updateTab(activeTab.id, { title: title || activeTab.title });
              }
            } catch (error) {
                console.warn("Could not access iframe title:", error);
            }
          }}
        />
      </div>
    </div>
  );
}
