'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Mic, ShoppingCart, Grid } from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useFarmer();
  const nav = t?.bottomNav || {
    home: 'Home',
    tasks: 'Tasks',
    ai: 'AI',
    market: 'Market',
    more: 'More',
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] max-w-[430px] mx-auto">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-0.5">{nav.home}</span>
        </Link>

        {/* 2. Tasks */}
        <Link
          href="/tasks"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/tasks' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <CheckSquare className={`w-5 h-5 ${pathname === '/tasks' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-0.5">{nav.tasks}</span>
        </Link>

        {/* 3. Central AI Floating Action Button with Mic */}
        <div className="flex justify-center -mt-6">
          <Link
            href="/assistant"
            className="flex flex-col items-center justify-center"
            aria-label="AI Assistant"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 ring-4 ring-white active:scale-95 transition-all">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 mt-0.5">{nav.ai}</span>
          </Link>
        </div>

        {/* 4. Market */}
        <Link
          href="/market"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/market' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <ShoppingCart className={`w-5 h-5 ${pathname === '/market' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-0.5">{nav.market}</span>
        </Link>

        {/* 5. More */}
        <Link
          href="/more"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/more' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <Grid className={`w-5 h-5 ${pathname === '/more' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] mt-0.5">{nav.more}</span>
        </Link>

      </div>
    </nav>
  );
};
