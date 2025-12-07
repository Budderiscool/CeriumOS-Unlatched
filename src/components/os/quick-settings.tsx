"use client";

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wifi, Volume2, Sun, Moon } from 'lucide-react';

export default function QuickSettings() {
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(50);
  const [wifiOn, setWifiOn] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Wifi className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4" side="top" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Quick Settings</h4>
            <p className="text-sm text-muted-foreground">Manage your system settings.</p>
          </div>
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="wifi-switch">Wi-Fi</Label>
              <Switch id="wifi-switch" checked={wifiOn} onCheckedChange={setWifiOn} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="brightness-slider">Brightness</Label>
                <Sun className="h-4 w-4" />
              </div>
              <Slider id="brightness-slider" defaultValue={[brightness]} max={100} step={1} onValueChange={([val]) => setBrightness(val)} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume-slider">Volume</Label>
                <Volume2 className="h-4 w-4" />
              </div>
              <Slider id="volume-slider" defaultValue={[volume]} max={100} step={1} onValueChange={([val]) => setVolume(val)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-switch">Dark Mode</Label>
              <Switch id="theme-switch" checked={darkMode} onCheckedChange={handleThemeChange} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
