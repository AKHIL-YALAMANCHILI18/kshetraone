'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Globe, 
  MapPin, 
  RefreshCw, 
  Check, 
  ChevronDown,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useFarmer } from '@/context/FarmerContext';
import { languageList } from '@/i18n/translations';
import { LanguageCode } from '@/types';

export const TopHeader: React.FC = () => {
  const { profile, language, setLanguage, resetToOnboarding, resetToDefaultData } = useFarmer();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 px-4 py-2.5 max-w-md mx-auto">
      <div className="flex items-center justify-between gap-2">
        {/* Farmer Location & Name Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-stone-900 truncate">
                {profile.name}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {profile.farmType}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">
                {profile.location.village}, {profile.location.district}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Language, Settings, Notification */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowPresetMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-stone-600" />
              <span>{languageList.find(l => l.code === language)?.name.slice(0, 3)}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Select Language
                </div>
                {languageList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as LanguageCode);
                      setShowLangMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors"
                  >
                    <span className={language === lang.code ? 'font-bold text-emerald-800' : 'text-stone-700'}>
                      {lang.name} ({lang.label})
                    </span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset / Reset Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPresetMenu(!showPresetMenu);
                setShowLangMenu(false);
              }}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200"
              title="Profile & Reset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {showPresetMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-stone-100 pb-1">
                  Ecosystem State
                </div>
                
                <button
                  onClick={() => {
                    resetToDefaultData();
                    setShowPresetMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-800"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                  <div>
                    <p className="font-bold text-xs">Reset Sample Data</p>
                    <p className="text-[10px] text-stone-500">Restore Mandya mixed farm</p>
                  </div>
                </button>

                <div className="border-t border-stone-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      resetToOnboarding();
                      setShowPresetMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-amber-700 hover:bg-amber-50 font-bold flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Run Onboarding Wizard</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Indicator */}
          <div className="relative">
            <Link 
              href="/tasks"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors block"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-stone-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white"></span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
