import React from 'react';
import { Menu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 relative flex items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">Alaska</span>
        
        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};