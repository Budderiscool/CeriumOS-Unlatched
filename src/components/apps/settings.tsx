
"use client";

import { useState, useEffect } from 'react';
import { Bell, Brush, HardDrive, UserCircle, Palette, Moon, Sun } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const settingsCategories = [
  { id: "appearance", name: "Appearance", icon: Brush },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "storage", name: "Storage", icon: HardDrive },
  { id: "account", name: "Account", icon: UserCircle },
];

const themes = [
    { name: 'Default', primary: '207 82% 67%' },
    { name: 'Forest', primary: '140 50% 50%' },
    { name: 'Sky', primary: '190 70% 60%' },
    { name: 'Sunset', primary: '25 80% 60%' },
    { name: 'Rose', primary: '340 80% 70%' },
]

function AppearanceSettings() {
    const [darkMode, setDarkMode] = useState(true);
    const [activeTheme, setActiveTheme] = useState('207 82% 67%');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);

        const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        setActiveTheme(currentPrimary);
    }, []);

    const handleThemeChange = (isDark: boolean) => {
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    };

    const handleColorChange = (hslColor: string) => {
        setActiveTheme(hslColor);
        document.documentElement.style.setProperty('--primary', hslColor);
        document.documentElement.style.setProperty('--ring', hslColor);
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Appearance</h3>
            <p className="text-muted-foreground mb-8">
                Customize the look and feel of CeriumOS.
            </p>
            
            <Card className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className='flex items-center gap-3'>
                            {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" /> }
                            <Label htmlFor="theme-switch" className="text-base">Dark Mode</Label>
                        </div>
                        <Switch id="theme-switch" checked={darkMode} onCheckedChange={handleThemeChange} />
                    </div>

                    <div className="space-y-4">
                         <div className='flex items-center gap-3'>
                            <Palette className="w-5 h-5 text-primary" />
                            <Label className="text-base">Accent Color</Label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {themes.map(theme => (
                                <Button
                                    key={theme.name}
                                    variant="outline"
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 rounded-full transition-all",
                                        activeTheme === theme.primary && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                    )}
                                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                                    onClick={() => handleColorChange(theme.primary)}
                                >
                                    <span className="sr-only">{theme.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}


function PlaceholderSettings({ title }: { title: string }) {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">
                Settings for {title.toLowerCase()} will be available here.
            </p>
            <div className="mt-8 p-6 border rounded-lg">
                <p className="text-center text-muted-foreground">
                    Coming soon.
                </p>
            </div>
        </div>
    );
}

export default function SettingsApp() {
    const [activeCategory, setActiveCategory] = useState('appearance');

    const renderContent = () => {
        switch(activeCategory) {
            case 'appearance':
                return <AppearanceSettings />;
            case 'notifications':
                return <PlaceholderSettings title="Notifications" />;
            case 'storage':
                return <PlaceholderSettings title="Storage" />;
            case 'account':
                return <PlaceholderSettings title="Account" />;
            default:
                return <AppearanceSettings />;
        }
    }

  return (
    <div className="w-full h-full flex bg-background">
        <aside className="w-1/3 h-full bg-secondary/50 border-r p-4">
            <h2 className="text-xl font-bold mb-4 px-2">Settings</h2>
            <nav>
                <ul>
                    {settingsCategories.map(category => (
                        <li key={category.id}>
                            <button 
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-lg text-left",
                                    activeCategory === category.id ? "bg-primary/20 text-primary-foreground" : "hover:bg-accent"
                                )}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                <category.icon className={cn("w-5 h-5", activeCategory === category.id ? "text-primary" : "")} />
                                <span className="font-medium">{category.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
        <main className="w-2/3 h-full p-8 overflow-y-auto">
            {renderContent()}
        </main>
    </div>
  );
}
