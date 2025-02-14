'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";

interface GlobalContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setIsSidebarOpen(false);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setIsSidebarOpen(true);
      } else {
        setScreenSize('desktop');
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isSearchOpen && !isSidebarOpen) {
      setIsSearchOpen(false);
    }
  };

  return (
    <SessionProvider>
    <GlobalContext.Provider value={{ 
      isSidebarOpen, 
      toggleSidebar, 
      setIsSidebarOpen,
      screenSize,
      isSearchOpen,
      setIsSearchOpen
    }}>
      {children}
    </GlobalContext.Provider>
    </SessionProvider>
  );
}

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};