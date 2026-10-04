'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [deviceWidth, setDeviceWidth] = useState<'360px' | '375px' | '390px' | '430px'>('390px');
  const [showTesterBar, setShowTesterBar] = useState(true);

  return (
    <div className="min-h-screen sm:min-h-screen bg-transparent sm:bg-stone-900 flex flex-col justify-start sm:justify-center items-center py-0 sm:py-4 sm:px-4">
      
      {/* Desktop Responsive Width Simulator Bar */}
      {showTesterBar && (
        <div className="hidden sm:flex items-center gap-2 mb-3 bg-stone-800/90 border border-stone-700/80 px-3.5 py-1.5 rounded-full text-xs text-stone-300 shadow-lg backdrop-blur-sm z-50">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-stone-400">Preview Width:</span>
          {(['360px', '375px', '390px', '430px'] as const).map((width) => (
            <button
              key={width}
              onClick={() => setDeviceWidth(width)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                deviceWidth === width
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-700 hover:bg-stone-600 text-stone-300'
              }`}
            >
              {width}
            </button>
          ))}
          <button
            onClick={() => setShowTesterBar(false)}
            className="text-[10px] text-stone-500 hover:text-stone-300 ml-1.5 underline"
          >
            Hide
          </button>
        </div>
      )}

      {/* Outer Shell: Full screen on mobile, phone frame container on desktop */}
      <div 
        style={{ maxWidth: '100%' }}
        className="w-full sm:max-w-[390px] min-h-screen sm:min-h-0 sm:h-[840px] bg-[#F7FAF8] sm:rounded-[36px] shadow-none sm:shadow-2xl sm:border-[8px] sm:border-stone-800 flex flex-col relative overflow-hidden transition-all duration-200"
      >
        
        {/* Android Notch / Speaker Ear-piece */}
        <div className="hidden sm:flex justify-center items-center h-4.5 bg-stone-800 w-28 mx-auto rounded-b-xl absolute top-0 left-0 right-0 z-50">
          <div className="w-10 h-1 bg-stone-600 rounded-full"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-700 ml-2"></div>
        </div>

        {/* Scrollable Viewport Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative bg-[#F7FAF8]">
          {children}
        </div>

        {/* Device Bottom Indicator */}
        <div className="hidden sm:block absolute bottom-1 left-0 right-0 text-center pointer-events-none z-50">
          <div className="w-20 h-1 bg-stone-300 rounded-full mx-auto opacity-60"></div>
        </div>
      </div>
    </div>
  );
};
