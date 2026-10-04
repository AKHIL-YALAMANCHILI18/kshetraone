'use client';

import React from 'react';
import { useFarmer } from '@/context/FarmerContext';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import Image from 'next/image';
import { Sprout } from 'lucide-react';

export default function HomePage() {
  const { isOnboardingComplete, isHydrated } = useFarmer();

  // Prevent screen flash while local session & storage are hydrating
  if (!isHydrated) {
    return (
      <div className="relative flex-1 w-full flex flex-col justify-between p-4 sm:p-6 text-center animate-in fade-in overflow-hidden min-h-[100dvh] sm:min-h-[720px] max-w-[430px] mx-auto select-none">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <Image
            src="/images/kshetraone-splash-illustration.png"
            alt="KshetraOne Illustrated Farmland Background"
            fill
            priority
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover object-bottom select-none"
          />
        </div>
        <div className="relative z-10 pt-6 sm:pt-10 shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-700 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-700/20 mb-3 ring-4 ring-emerald-100 animate-pulse">
            <Sprout className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight drop-shadow-sm">
            KshetraOne
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 mt-1 uppercase tracking-wider">
            One Ecosystem. Every Farm. Every Day.
          </p>
        </div>
        <div className="relative z-10 flex justify-center pb-12">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isOnboardingComplete) {
    return <OnboardingWizard />;
  }

  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-y-auto">
        <HomeDashboard />
      </main>
      <BottomNav />
    </>
  );
}
