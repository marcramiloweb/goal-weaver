import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Target, BarChart3, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Hoy' },
  { path: '/goals', icon: Target, label: 'Metas' },
  { path: '/achievements', icon: Trophy, label: 'Logros' },
  { path: '/progress', icon: BarChart3, label: 'Progreso' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-full px-4 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
