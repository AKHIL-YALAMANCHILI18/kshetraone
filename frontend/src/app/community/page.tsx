'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users2, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Sparkles,
  Search
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';

export default function CommunityPage() {
  const { showToast } = useFarmer();

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20">
      
      {/* HEADER */}
      <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black">Community</h1>
        </div>
      </header>

      {/* BODY CONTENT (SCREEN 10 & 24) */}
      <div className="p-3.5 space-y-3.5">
        
        {/* SUB-TABS: For You, Karnataka, Ballari */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-2xl text-xs font-bold">
          <button className="flex-1 py-1.5 rounded-xl bg-emerald-700 text-white shadow-2xs">For You</button>
          <button className="flex-1 py-1.5 rounded-xl text-stone-500">Karnataka</button>
          <button className="flex-1 py-1.5 rounded-xl text-stone-500">Ballari</button>
        </div>

        {/* POST 1: SHIVANNA (MATCHING SCREEN 10 & 24) */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm font-bold text-amber-900">
              S
            </div>
            <div>
              <h3 className="font-bold text-xs text-stone-900">Shivanna</h3>
              <p className="text-[10px] text-stone-500">Ballari, Karnataka • 2h ago</p>
            </div>
          </div>

          <p className="text-xs text-stone-800 leading-relaxed">
            Sharing my experience with organic farming. This method worked well for groundnut crop!
          </p>

          <div className="flex items-center gap-4 pt-1.5 border-t border-stone-100 text-xs text-stone-500 font-semibold">
            <span className="flex items-center gap-1">👍 24</span>
            <span className="flex items-center gap-1">💬 6</span>
            <span className="flex items-center gap-1">↗️ Share</span>
          </div>
        </div>

        {/* POST 2: AGRI EXPERT (MATCHING SCREEN 10) */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-sm font-bold text-emerald-900">
              E
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-xs text-stone-900">Agri Expert</h3>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Agronomist</span>
              </div>
              <p className="text-[10px] text-stone-500">KVK Officer • 5h ago</p>
            </div>
          </div>

          <p className="text-xs text-stone-800 leading-relaxed">
            Good monsoon expected next week. Prepare your fields for pre-emergence weed management.
          </p>

          <div className="flex items-center gap-4 pt-1.5 border-t border-stone-100 text-xs text-stone-500 font-semibold">
            <span className="flex items-center gap-1">👍 48</span>
            <span className="flex items-center gap-1">💬 14</span>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
