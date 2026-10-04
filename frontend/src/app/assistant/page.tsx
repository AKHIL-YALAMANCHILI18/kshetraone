'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Mic, 
  Send, 
  Bot, 
  Sparkles,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AssistantPage() {
  const { profile, cropCycles, milkRecords, financialSummary, showToast } = useFarmer();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleQuery = (text: string) => {
    setQuery(text);
    const lower = text.toLowerCase();
    if (lower.includes('milk')) {
      setResponse(`Today's recorded milk production is ${milkRecords[0]?.totalLiters || 22} Litres (Morning: 12L, Evening: 10L). Estimated revenue: ₹1,250.`);
    } else if (lower.includes('crop') || lower.includes('disease')) {
      setResponse(`Active crops in Ballari: Maize (2 Acres), Tomato (3 Acres), Chilli (1 Acre). Maize Fall Armyworm scan recorded with 92% confidence.`);
    } else if (lower.includes('market') || lower.includes('price')) {
      setResponse(`Today's prevailing market rate in Ballari APMC for Tomato is ₹18/kg (+2%). High buyer demand detected (180 Tonnes).`);
    } else {
      setResponse(`Hello ${profile.name}! All farm operations in ${profile.location.village} are tracked. Weather is sunny at 28°C.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9F6] text-stone-900 pb-20 justify-between">
      
      {/* HEADER */}
      <div>
        <header className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 rounded-lg hover:bg-emerald-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black">KshetraOne AI</h1>
          </div>
        </header>

        {/* BODY CONTENT (SCREEN 6 & 25: AI ASSISTANT VOICE/TEXT) */}
        <div className="p-4 space-y-4 text-center">
          
          {/* BIG GREEN MIC CIRCLE */}
          <div className="pt-2">
            <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-500 mx-auto flex items-center justify-center shadow-md active:scale-95 cursor-pointer transition-all">
              <Mic className="w-10 h-10 text-emerald-700" />
            </div>
            <h2 className="text-base font-black text-stone-900 mt-3">How can I help you today?</h2>
            <p className="text-xs text-stone-500">Tap the mic to speak or select a query below</p>
          </div>

          {/* SUGGESTED INTENT BUTTONS (SCREEN 6 & 25) */}
          <div className="space-y-2 text-left pt-2">
            {[
              'Check my crop disease',
              "Show today's market price",
              'My milk record',
              'Remind vaccination',
              'Show my farm summary'
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuery(item)}
                className="w-full p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between text-xs font-semibold text-stone-800 hover:border-emerald-400 active:scale-98 transition-all"
              >
                <span>🔍 {item}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>

          {/* RESPONSE CARD */}
          {response && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-left space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Bot className="w-4 h-4 text-emerald-700" />
                <span>KshetraOne AI Answer:</span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed font-normal">
                {response}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM INPUT BAR */}
      <div className="p-3.5 bg-white border-t border-stone-200">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (query) handleQuery(query);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 h-11 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="submit"
            className="h-11 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
          >
            Ask
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
