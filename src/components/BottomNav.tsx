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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] md:hidden">
      <div className="grid grid-cols-4 max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition min-h-[48px] cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-teal-700 font-bold bg-teal-50 border border-teal-400 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">แดชบอร์ด</span>
        </button>

        {/* New Screening */}
        <button
          onClick={() => onChangeTab('new_screening')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition relative min-h-[48px] cursor-pointer ${
            activeTab === 'new_screening'
              ? 'text-emerald-700 font-bold bg-emerald-50 border border-emerald-400 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md -mt-2">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] mt-0.5">คัดกรอง</span>
        </button>

        {/* Patient List */}
        <button
          onClick={() => onChangeTab('patient_list')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition relative min-h-[48px] cursor-pointer ${
            activeTab === 'patient_list'
              ? 'text-blue-700 font-bold bg-blue-50 border border-blue-400 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {highRiskCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {highRiskCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">คนไข้</span>
        </button>

        {/* Members / Admin */}
        <button
          onClick={() => onChangeTab('members')}
          className={`flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-xl transition min-h-[48px] cursor-pointer ${
            activeTab === 'members'
              ? 'text-purple-700 font-bold bg-purple-50 border border-purple-400 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">
            {currentUser.role === 'ADMIN' ? 'สมาชิก' : 'โปรไฟล์'}
          </span>
        </button>
      </div>
    </nav>
  );
};
