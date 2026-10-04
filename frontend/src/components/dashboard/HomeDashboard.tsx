'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  MapPin, 
  ChevronDown,
  Sun,
  Sprout,
  Milk,
  IndianRupee,
  Warehouse,
  ShoppingBag,
  Users2,
  Mic,
  Calendar,
  AlertCircle,
  TrendingUp,
  Check
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';

export const HomeDashboard: React.FC = () => {
  const { 
    profile, 
    cropCycles, 
    milkRecords, 
    financialSummary, 
    transactions,
    inventory, 
    tasks,
    t 
  } = useFarmer();

  const todayMilk = milkRecords[0] || { totalLiters: 18, morningLiters: 10, eveningLiters: 8 };
  const todayIncomeTotal = transactions
    .filter(tx => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* 1. TOP HEADER (Green Bar from Mockup Screen 5 & 10) */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-emerald-500 overflow-hidden flex items-center justify-center font-bold text-base text-amber-200">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-200 font-medium">
              <span>Good Morning,</span>
            </div>
            <h1 className="text-base font-black text-white leading-tight">
              {profile.name}
            </h1>
            <p className="text-[11px] text-emerald-100 flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-300" />
              <span>{profile.location.district}, {profile.location.state}</span>
            </p>
          </div>
        </div>

        {/* Weather Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-800/80 px-2.5 py-1.5 rounded-2xl border border-emerald-600/50">
          <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
          <div className="text-right leading-none">
            <span className="font-bold text-sm block">28°C</span>
            <span className="text-[10px] text-emerald-200">Sunny</span>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <div className="p-3.5 space-y-3.5">
        
        {/* ROW 1: METRICS 4-GRID (Today's Milk, Today's Income, Active Crops, Pending Tasks) */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Today's Milk */}
          <Link href="/dairy" className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-semibold text-stone-600">Today&apos;s Milk</span>
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                <Milk className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="text-2xl font-black text-stone-900">{todayMilk.totalLiters || 18}</span>
              <span className="text-xs font-bold text-stone-500 ml-1">L</span>
            </div>
          </Link>

          {/* Today's Income */}
          <Link href="/finance" className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-semibold text-stone-600">{t?.todayIncome || "Today's Income"}</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="text-xs font-bold text-stone-400">₹</span>
              <span className="text-2xl font-black text-emerald-700">
                {todayIncomeTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </Link>

          {/* Active Crops */}
          <Link href="/agri" className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-semibold text-stone-600">Active Crops</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Sprout className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="text-2xl font-black text-stone-900">{cropCycles.filter(c => c.status === 'active').length || 3}</span>
            </div>
          </Link>

          {/* Pending Tasks */}
          <Link href="/tasks" className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[11px] font-semibold text-stone-600">Pending Tasks</span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="text-2xl font-black text-stone-900">{tasks.filter(t => !t.completed).length || 4}</span>
            </div>
          </Link>

        </div>

        {/* 3. LARGE GREEN BANNER: ASK KSHETRAONE (Voice Search from Image 1 & 2) */}
        <Link 
          href="/assistant"
          className="bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-3 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 border border-emerald-500/60 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight text-white">Ask KshetraOne</p>
              <p className="text-[11px] text-emerald-200">Speak or type in your language</p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-emerald-100">
            →
          </div>
        </Link>

        {/* 4. SIX CORE MODULE CARDS GRID (Crops, Dairy, Finance, Warehouse, Marketplace, Community) */}
        <div>
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Module 1: Crops */}
            <Link 
              href="/agri"
              className="bg-[#EAF5EC] p-3 rounded-2xl border border-emerald-200/60 flex items-center gap-3 active:scale-98 transition-all hover:border-emerald-400"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-stone-900 leading-tight">Crops</p>
                <p className="text-[10px] text-stone-500 mt-0.5">3 fields</p>
              </div>
            </Link>

            {/* Module 2: Dairy */}
            <Link 
              href="/dairy"
              className="bg-[#FDF3E7] p-3 rounded-2xl border border-amber-200/60 flex items-center gap-3 active:scale-98 transition-all hover:border-amber-400"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Milk className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-stone-900 leading-tight">Dairy</p>
                <p className="text-[10px] text-stone-500 mt-0.5">5 animals</p>
              </div>
            </Link>

            {/* Module 3: Finance */}
            <Link 
              href="/finance"
              className="bg-[#EBF3FB] p-3 rounded-2xl border border-sky-200/60 flex items-center gap-3 active:scale-98 transition-all hover:border-sky-400"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-stone-900 leading-tight">Finance</p>
                <p className="text-[10px] text-stone-500 mt-0.5">₹ 12,450 this month</p>
              </div>
            </Link>

            {/* Module 4: Warehouse */}
            <Link 
              href="/warehouse"
              className="bg-[#F8EFEA] p-3 rounded-2xl border border-orange-200/60 flex items-center gap-3 active:scale-98 transition-all hover:border-orange-400"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Warehouse className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-stone-900 leading-tight">Warehouse</p>
                <p className="text-[10px] text-stone-500 mt-0.5">20 q (Maize)</p>
              </div>
            </Link>

            {/* Module 5: Marketplace */}
            <Link 
              href="/market"
              className="bg-[#F3EAF8] p-3 rounded-2xl border border-purple-200/60 flex items-center gap-3 active:scale-98 transition-all hover:border-purple-400"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-stone-900 leading-tight">Marketplace</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Nearby rates</p>
              </div>
            </Link>

            {/* Module 6: Community */}
            <Link 
              href="/community"
              className="bg-[#EBF7F7] p-3 rounded-2xl border border-teal-200/60 flex items-center gap-3 active:scale-98 transition-all hover:border-teal-400"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Users2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-stone-900 leading-tight">Community</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Local farmers</p>
              </div>
            </Link>

          </div>
        </div>

        {/* 5. TODAY'S TASKS TICKER (From Screen 10 / Module Screens) */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">{t?.todayTasks || "Today's Tasks"}</span>
            <Link href="/tasks" className="text-xs text-emerald-700 font-bold hover:underline">View All ({tasks.length})</Link>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-xs text-stone-800">
                <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={task.completed ? 'line-through text-stone-400' : 'font-medium'}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
