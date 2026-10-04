'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  Milk, 
  Sprout, 
  Warehouse, 
  PieChart as PieIcon,
  Download,
  Calendar
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export default function ReportsPage() {
  const { profile, financialSummary, cropCycles, milkRecords, inventory, showToast } = useFarmer();

  const handleExportPDF = () => {
    showToast("Generating verified Seasonal Farm Summary PDF for bank loan application...");
  };

  return (
    <>
      <TopHeader />
      <main className="flex-1 p-3.5 sm:p-4 pb-24 overflow-y-auto space-y-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/more" className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 min-w-[40px] min-h-[40px] flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-stone-700" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-stone-900 leading-tight">Farm Analytics & Reports</h1>
              <p className="text-[11px] text-stone-500">Kharif Season 2026 Profitability & Asset Audit</p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 active:scale-95"
            title="Export Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Net Farm Wealth Card */}
        <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-4 rounded-3xl shadow-md space-y-3">
          <div>
            <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Total Operational Profit</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-emerald-300">₹</span>
              <span className="text-3xl font-black text-white">{financialSummary.netProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800 text-xs">
            <div>
              <p className="text-emerald-300 text-[10px]">Total Revenue</p>
              <p className="font-bold text-white text-sm">+₹{financialSummary.totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-emerald-300 text-[10px]">Total Expenditures</p>
              <p className="font-bold text-white text-sm">-₹{financialSummary.totalExpense.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* 2. Enterprise Contribution */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <PieIcon className="w-3.5 h-3.5 text-emerald-700" /> Enterprise Profitability Share
          </h2>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                <span className="flex items-center gap-1">
                  <Milk className="w-3.5 h-3.5 text-sky-600" /> Dairy & Livestock
                </span>
                <span className="font-bold text-sky-800">₹{financialSummary.dairyProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                <span className="flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Crop Cultivation
                </span>
                <span className="font-bold text-emerald-800">₹{financialSummary.cropProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Harvest & Stored Assets Summary */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2.5">
          <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5 text-amber-700" /> Stored Produce Valuations
          </h2>

          <div className="space-y-2">
            {inventory.map(item => (
              <div key={item.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-stone-900">{item.commodityName}</p>
                  <p className="text-[10px] text-stone-500">{item.quantityQuintals} Quintals stored • Grade {item.grade.split(' - ')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-stone-900 text-sm">₹{(item.quantityQuintals * 3800).toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-stone-400">Est. Market Value</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Official Report Certificate Preview */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex justify-between items-center">
          <div>
            <p className="font-bold text-stone-900 text-xs">FPO / Bank Verification Status</p>
            <p className="text-[10px] text-stone-500">NABARD & PM-Kisan Compliance Ready</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl font-bold text-xs active:scale-95"
          >
            Download PDF
          </button>
        </div>

      </main>
      <BottomNav />
    </>
  );
}
