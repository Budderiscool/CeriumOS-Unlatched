"use client";

import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    updateClock();
    const timerId = setInterval(updateClock, 60000); // Update every minute

    return () => clearInterval(timerId);
  }, []);

  if (!time) {
    return <div className="w-16 h-6 rounded-md bg-muted animate-pulse" />;
  }

  return (
    <div className="text-sm font-medium px-2">
      {time}
    </div>
  );
}
