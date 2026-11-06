import React from 'react';
import { LayoutDashboard, UserPlus, Users, ShieldAlert } from 'lucide-react';
import { User } from '../types';

export type ActiveTab = 'dashboard' | 'new_screening' | 'patient_list' | 'members';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  currentUser: User;
  highRiskCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  currentUser,
  highRiskCount,
}) => {
  const isCitizen = currentUser.role === 'CITIZEN';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-200/80 shadow-lg px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] md:hidden">
      <div className={`grid ${isCitizen ? 'grid-cols-3' : 'grid-cols-4'} max-w-md mx-auto`}>
        {/* Dashboard / My Results */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition min-h-[48px] cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-rose-800 font-bold bg-rose-50 border border-rose-300 shadow-2xs'
              : 'text-slate-500 hover:text-rose-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isCitizen ? 'ผลประเมิน' : 'แดชบอร์ด'}</span>
        </button>

        {/* New Screening / Self-Screening */}
        <button
          onClick={() => onChangeTab('new_screening')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition relative min-h-[48px] cursor-pointer ${
            activeTab === 'new_screening'
              ? 'text-pink-800 font-bold bg-pink-50 border border-pink-300 shadow-2xs'
              : 'text-slate-500 hover:text-pink-900'
          }`}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-md -mt-2">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] mt-0.5">{isCitizen ? 'ทำแบบประเมิน' : 'คัดกรอง'}</span>
        </button>

        {/* Patient List / My Assessment History */}
        <button
          onClick={() => onChangeTab('patient_list')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition relative min-h-[48px] cursor-pointer ${
            activeTab === 'patient_list'
              ? 'text-rose-900 font-bold bg-rose-50 border border-rose-300 shadow-2xs'
              : 'text-slate-500 hover:text-rose-900'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {highRiskCount > 0 && !isCitizen && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {highRiskCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{isCitizen ? 'ประวัติ' : 'คนไข้'}</span>
        </button>

        {/* Members / Admin - only for staff */}
        {!isCitizen && (
          <button
            onClick={() => onChangeTab('members')}
            className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition min-h-[48px] cursor-pointer ${
              activeTab === 'members'
                ? 'text-fuchsia-900 font-bold bg-fuchsia-50 border border-fuchsia-300 shadow-2xs'
                : 'text-slate-500 hover:text-fuchsia-900'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">
              {currentUser.role === 'ADMIN' ? 'สมาชิก' : 'โปรไฟล์'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
