import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="relative mx-auto w-full max-w-[420px] h-[840px] max-h-[92vh] bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-slate-900/30 border-4 border-slate-800 flex flex-col overflow-hidden">
      {/* Dynamic island / Camera punchhole */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
      </div>

      {/* Screen container */}
      <div className="relative w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col border border-slate-200">
        {/* Android Status Bar */}
        <div className="h-8 bg-slate-900 text-white px-6 flex items-center justify-between text-xs font-medium z-40 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 opacity-90">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 text-slate-900 min-h-0">
          {children}
        </div>

        {/* Android Navigation bar pill */}
        <div className="h-4 bg-slate-50 flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
