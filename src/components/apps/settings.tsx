"use client";

import { Bell, Brush, HardDrive, UserCircle } from "lucide-react";

const settingsCategories = [
  { name: "Appearance", icon: Brush },
  { name: "Notifications", icon: Bell },
  { name: "Storage", icon: HardDrive },
  { name: "Account", icon: UserCircle },
];

export default function SettingsApp() {
  return (
    <div className="w-full h-full flex bg-background">
        <aside className="w-1/3 h-full bg-secondary/50 border-r p-4">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <nav>
                <ul>
                    {settingsCategories.map(category => (
                        <li key={category.name}>
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                                <category.icon className="w-5 h-5 text-primary" />
                                <span className="font-medium">{category.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
        <main className="w-2/3 h-full p-8">
            <h3 className="text-2xl font-bold mb-2">Appearance</h3>
            <p className="text-muted-foreground">
                Customize the look and feel of CeriumOS.
            </p>
            <div className="mt-8 p-6 border rounded-lg">
                <p className="text-center text-muted-foreground">
                    Appearance settings will be available here.
                </p>
            </div>
        </main>
    </div>
  );
}
