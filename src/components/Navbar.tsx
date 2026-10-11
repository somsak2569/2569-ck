import React, { useState } from 'react';
import { User } from '../types';
import { ActiveTab } from './BottomNav';
import { 
  HeartHandshake, 
  PhoneCall, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  MapPin, 
  Building2, 
  HelpCircle,
  Menu,
  X,
  Database,
  LayoutDashboard,
  UserPlus,
  Users,
  ShieldAlert,
  Eye
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/chiangklangData';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenEmergencyGuide: () => void;
  highRiskCount: number;
  activeTab?: ActiveTab;
  onChangeTab?: (tab: ActiveTab) => void;
  accessiblePatientCount?: number;
  onStartNewScreening?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenEmergencyGuide,
  highRiskCount,
  activeTab = 'dashboard',
  onChangeTab,
  accessiblePatientCount = 0,
  onStartNewScreening,
}) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-md">
        {/* District & Safety emergency strip */}
        <div className="bg-teal-900 px-2 sm:px-4 py-1 text-xs flex justify-between items-center text-teal-100 border-b border-teal-800/60">
          <div className="flex items-center gap-1.5 truncate min-w-0 mr-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-semibold text-white truncate text-[11px] sm:text-xs">
              สสอ.เชียงกลาง
            </span>
            <span className="text-teal-400/60 hidden sm:inline">|</span>
            <span className="text-teal-200 hidden md:inline text-[11px]">
              คัดกรอง 2Q+ & 8Q กรมสุขภาพจิต
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
              title="เบอร์โทรฉุกเฉินและประสานงานด่วน สายด่วน 1323"
            >
              <PhoneCall className="w-3 h-3 animate-bounce shrink-0" />
              <span>สายด่วน 1323</span>
              {highRiskCount > 0 && (
                <span className="bg-white text-rose-700 font-extrabold px-1 rounded-full text-[9px] sm:text-[10px] ml-0.5 animate-pulse">
                  {highRiskCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenEmergencyGuide}
              className="flex items-center gap-1 text-teal-200 hover:text-white bg-teal-800/80 hover:bg-teal-800 border border-teal-700/60 rounded-lg px-1.5 py-0.5 transition shrink-0 cursor-pointer text-[10px] sm:text-[11px]"
              title="คู่มือช่วยเหลือ 3 ส."
            >
              <HelpCircle className="w-3 h-3 text-amber-300 shrink-0" />
              <span>คู่มือ 3ส.</span>
            </button>
          </div>
        </div>

        {/* Main App Bar */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 flex items-center justify-between gap-2">
          {/* Logo & District Branding */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md text-white border border-teal-400/30 shrink-0">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm sm:text-base md:text-lg leading-tight tracking-tight text-white truncate">
                  คนเชียงกลางไม่ทิ้งกัน
                </h1>
                <span className="text-[9px] sm:text-[10px] bg-teal-700/90 text-teal-200 px-1.5 py-0.2 rounded border border-teal-600/80 font-normal shrink-0">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-teal-200/90 leading-tight truncate">
                สสอ.เชียงกลาง • ดูแลใจด้วยใจ
              </p>
            </div>
          </div>

          {/* User Status & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Jurisdiction Tag (Desktop) */}
            <div className="hidden lg:flex flex-col items-end text-xs mr-1">
              <div className="flex items-center gap-1 text-teal-100">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium">
                  {currentUser.role === 'ADMIN' ? 'ทุกตำบลใน อ.เชียงกลาง' : `ต.${currentUser.tambon}`}
                </span>
              </div>
              <div className="flex items-center gap-1 text-teal-300 text-[11px]">
                <Building2 className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{currentUser.hospital}</span>
              </div>
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton variant="navbar" />

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-900 text-slate-100 hover:text-white font-semibold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition border-2 border-slate-600/90 hover:border-slate-400 shrink-0 cursor-pointer"
              title="ออกจากระบบ เพื่อกลับไปหน้าเข้าสู่ระบบ"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-300 group-hover:text-white shrink-0" />
              <span>ออกจากระบบ</span>
            </button>

            {/* Profile Dropdown / Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 sm:gap-2 bg-teal-700/80 hover:bg-teal-700 border border-teal-600/90 rounded-xl px-2 sm:px-2.5 py-1.5 transition text-left cursor-pointer"
                title={`บัญชี: ${currentUser.fullName} (${currentUser.roleLabel})`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0">
                  {currentUser.role === 'ADMIN' ? (
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold leading-none truncate max-w-[110px] md:max-w-[130px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-teal-200 leading-tight mt-0.5 truncate max-w-[110px] md:max-w-[130px]">
                    {currentUser.role === 'ADMIN'
                      ? 'แอดมิน สสอ.'
                      : currentUser.role === 'HEALTH_OFFICER'
                      ? 'จนท. รพ.สต.'
                      : 'อสม. ประจำหมู่บ้าน'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              </button>

              {/* User Menu Modal / Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                        {currentUser.fullName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-sm truncate">{currentUser.fullName}</div>
                        <div className="text-xs text-teal-700 font-medium">{currentUser.roleLabel}</div>
                      </div>
                    </div>

                    <div className="mt-2.5 bg-slate-50 p-2 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ชื่อผู้ใช้:</span>
                        <span className="font-mono font-medium text-slate-700">{currentUser.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">เขตพื้นที่:</span>
                        <span className="font-medium text-slate-700">
                          {currentUser.role === 'ADMIN' ? 'ทั้งอำเภอเชียงกลาง' : `ตำบล${currentUser.tambon}`}
                        </span>
                      </div>
                      {currentUser.village && currentUser.village !== 'ทั้งหมด' && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">หมู่บ้าน:</span>
                          <span className="font-medium text-slate-700 truncate">{currentUser.village}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">สังกัด/พี่เลี้ยง:</span>
                        <span className="font-medium text-slate-700 truncate">{currentUser.hospital}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onChangeTab) onChangeTab('members');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition text-left cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>หน้าต่างข้อมูล & จัดการสมาชิก</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenLogin();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition text-left cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>สลับบัญชีผู้ใช้</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-t border-slate-100 mt-1 rounded-lg transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu Bar in Frame Header */}
        <div className="bg-white border-t border-b border-slate-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1 sm:gap-3">
            {/* The 4 Responsive Menu Buttons with Distinct Colored Borders */}
            <nav className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
              {/* Button 1: แดชบอร์ด สรุปภาพรวม (Teal Colored Border) */}
              <button
                onClick={() => onChangeTab && onChangeTab('dashboard')}
                className={`flex-1 sm:flex-initial shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10.5px] xs:text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border-2 cursor-pointer shadow-2xs ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-700 text-white border-teal-900 shadow-sm ring-2 ring-teal-400/50'
                    : 'text-teal-900 bg-teal-50/70 border-teal-500 hover:bg-teal-100 hover:border-teal-700'
                }`}
                title="แดชบอร์ดสรุปภาพรวม"
              >
                <LayoutDashboard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-teal-700'}`} />
                <span>แดชบอร์ด</span>
                <span className="hidden md:inline">สรุปภาพรวม</span>
              </button>

              {/* Button 2: บันทึกคัดกรอง (2Q+&8Q) (Emerald Colored Border) */}
              <button
                onClick={() => {
                  if (onStartNewScreening) {
                    onStartNewScreening();
                  } else if (onChangeTab) {
                    onChangeTab('new_screening');
                  }
                }}
                className={`flex-1 sm:flex-initial shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10.5px] xs:text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border-2 cursor-pointer shadow-2xs ${
                  activeTab === 'new_screening'
                    ? 'bg-emerald-700 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-400/50'
                    : 'text-emerald-900 bg-emerald-50/70 border-emerald-500 hover:bg-emerald-100 hover:border-emerald-700'
                }`}
                title="บันทึกแบบคัดกรอง (2Q+ & 8Q)"
              >
                <UserPlus className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'new_screening' ? 'text-white' : 'text-emerald-700'}`} />
                <span>บันทึกคัดกรอง</span>
                <span className="hidden sm:inline text-[10px] sm:text-[11px]">(2Q+&8Q)</span>
              </button>

              {/* Button 3: ทะเบียนคนไข้ (Blue Colored Border) */}
              <button
                onClick={() => onChangeTab && onChangeTab('patient_list')}
                className={`flex-1 sm:flex-initial shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10.5px] xs:text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border-2 relative cursor-pointer shadow-2xs ${
                  activeTab === 'patient_list'
                    ? 'bg-blue-700 text-white border-blue-900 shadow-sm ring-2 ring-blue-400/50'
                    : 'text-blue-900 bg-blue-50/70 border-blue-500 hover:bg-blue-100 hover:border-blue-700'
                }`}
                title="ทะเบียนคนไข้ที่ได้รับการคัดกรอง"
              >
                <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'patient_list' ? 'text-white' : 'text-blue-700'}`} />
                <span>ทะเบียนคนไข้</span>
                {accessiblePatientCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${
                    activeTab === 'patient_list' 
                      ? 'bg-blue-900/90 text-blue-100 border-blue-400/40' 
                      : 'bg-white text-blue-800 border-blue-300 shadow-2xs'
                  }`}>
                    {accessiblePatientCount}
                  </span>
                )}
                {highRiskCount > 0 && (
                  <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse shrink-0 border border-rose-700 shadow-2xs">
                    {highRiskCount} <span className="hidden sm:inline">เสี่ยงสูง</span>
                  </span>
                )}
              </button>

              {/* Button 4: จัดการสมาชิก (Purple Colored Border) */}
              <button
                onClick={() => onChangeTab && onChangeTab('members')}
                className={`flex-1 sm:flex-initial shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10.5px] xs:text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 border-2 cursor-pointer shadow-2xs ${
                  activeTab === 'members'
                    ? 'bg-purple-700 text-white border-purple-900 shadow-sm ring-2 ring-purple-400/50'
                    : 'text-purple-900 bg-purple-50/70 border-purple-500 hover:bg-purple-100 hover:border-purple-700'
                }`}
                title={currentUser.role === 'ADMIN' ? 'จัดการสมาชิก สสอ./รพ.สต./อสม.' : 'ข้อมูลสังกัดและสมาชิก'}
              >
                <ShieldAlert className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'members' ? 'text-white' : 'text-purple-700'}`} />
                <span>
                  {currentUser.role === 'ADMIN' ? 'จัดการสมาชิก' : 'ข้อมูลสมาชิก'}
                </span>
                {currentUser.role === 'ADMIN' && (
                  <span className="hidden lg:inline text-[10px] opacity-90">(สสอ./รพ.สต./อสม.)</span>
                )}
              </button>
            </nav>

            {/* Jurisdiction info badge on right for tablets/desktop */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="truncate max-w-[200px]">
                สังกัด: <strong className="text-slate-700">{currentUser.hospital}</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Hotlines Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <PhoneCall className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-800">เบอร์โทรฉุกเฉินและประสานงานด่วน</h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                สำหรับผู้ป่วยที่มีคะแนน 8Q ระดับ <span className="text-rose-600 font-bold">"รุนแรง" (&gt;= 17 คะแนน)</span> หรือมีแนวโน้มจะทำร้ายตนเอง กรุณาติดต่อทันที:
              </p>

              <div className="space-y-2">
                {EMERGENCY_CONTACTS.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200/80 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.note}</div>
                    </div>
                    <a
                      href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
