import React from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="safe-bottom">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
