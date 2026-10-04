'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sprout, 
  Milk, 
  IndianRupee, 
  Warehouse, 
  Users2, 
  FileText, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MorePage() {
  const { resetToOnboarding, resetToDefaultData, logout, showToast, t } = useFarmer();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const modules = [
    { title: "Agriculture Intelligence", href: "/agri", desc: "Plots, crops, disease scans & soil reports", icon: Sprout, status: "Active", color: "text-emerald-700 bg-emerald-50" },
    { title: "Dairy & Livestock", href: "/dairy", desc: "Herd register, daily milk ledger & vaccinations", icon: Milk, status: "Active", color: "text-sky-700 bg-sky-50" },
    { title: "Farm Finance Ledger", href: "/finance", desc: "Auto-synced income, expenses & seasonal P&L", icon: IndianRupee, status: "Active", color: "text-amber-700 bg-amber-50" },
    { title: "Warehouse & Godown", href: "/warehouse", desc: "Stored harvest, stock movements & bag tracking", icon: Warehouse, status: "Active", color: "text-stone-700 bg-stone-100" },
    { title: "Smart Marketplace", href: "/market", desc: "e-NAM mandi rates, buyer requirements & sales", icon: IndianRupee, status: "Active", color: "text-emerald-700 bg-emerald-50" },
    { title: "Farmer Community", href: "/community", desc: "District crop groups, discussions & state feed", icon: Users2, status: "Active", color: "text-indigo-700 bg-indigo-50" },
    { title: "Analytics & Reports", href: "/reports", desc: "Exportable summaries for banks and FPOs", icon: FileText, status: "Active", color: "text-teal-700 bg-teal-50" },
  ];

  return (
    <>
      <TopHeader />
      <main className="flex-1 p-3.5 sm:p-4 pb-24 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/" className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 min-w-[40px] min-h-[40px] flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-stone-700" />
          </Link>
          <h1 className="text-lg font-black text-stone-900">Ecosystem Hub</h1>
        </div>

        {/* Modules List with Functional Links */}
        <div className="space-y-2 mb-5">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Link
                key={idx}
                href={m.href}
                className="p-3 min-h-[56px] bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-3 hover:border-emerald-300 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl ${m.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{m.title}</h2>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase shrink-0">
                        {m.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{m.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* Farmer Setup & Reset Controls */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2 mb-4">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Developer & Simulation Controls
          </div>
          <button
            onClick={resetToOnboarding}
            className="w-full p-3 min-h-[48px] rounded-xl bg-stone-50 hover:bg-stone-100 text-left text-xs font-bold text-stone-800 flex items-center justify-between border border-stone-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-xs">Rerun Onboarding Wizard</p>
                <p className="text-[10px] text-stone-500">Test Screens 1–9 from scratch (demo mode)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            onClick={resetToDefaultData}
            className="w-full p-3 min-h-[48px] rounded-xl bg-stone-50 hover:bg-stone-100 text-left text-xs font-bold text-stone-800 flex items-center justify-between border border-stone-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold text-xs">Reset to Sample Mixed Farm Data</p>
                <p className="text-[10px] text-stone-500">Restore default Mandya/Ballari farm records</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* ACCOUNT LOGOUT SECTION */}
        <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm space-y-2">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Active Session
          </div>
          <p className="text-[11px] text-stone-500">
            Note: Authentication is client-side demo authenticated for <span className="font-bold text-stone-800">Ramesh (+91 9876543210)</span>. Logging out clears the active login session while keeping your saved farm records safe in browser storage.
          </p>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3 min-h-[48px] rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <span>Log Out</span>
          </button>
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 space-y-4 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="font-black text-base text-stone-900">Confirm Logout</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Are you sure you want to end your active session? Your saved plots, crops, and milk records will remain safely stored.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 h-11 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowLogoutModal(false);
                    await logout();
                    window.location.href = '/';
                  }}
                  className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  Confirm Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
