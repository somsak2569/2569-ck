import React, { useState } from 'react';
import { User } from '../types';
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
  X
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/chiangklangData';

interface NavbarProps {
  currentUser: User;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenEmergencyGuide: () => void;
  highRiskCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenEmergencyGuide,
  highRiskCount,
}) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-md">
        {/* District & Safety emergency strip */}
        <div className="bg-teal-900 px-3 py-1 text-xs flex justify-between items-center text-teal-100 border-b border-teal-800/60">
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white truncate">สสอ.เชียงกลาง จ.น่าน</span>
            <span className="text-teal-300 hidden sm:inline">|</span>
            <span className="text-teal-200 hidden sm:inline">ระบบคัดกรอง 2Q Plus & 8Q กรมสุขภาพจิต</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1 bg-rose-600/90 hover:bg-rose-600 text-white px-2 py-0.5 rounded text-xs font-medium transition shadow-xs"
            >
              <PhoneCall className="w-3 h-3 animate-bounce" />
              <span>สายด่วน 1323</span>
              {highRiskCount > 0 && (
                <span className="bg-white text-rose-700 font-bold px-1 rounded-full text-[10px] ml-0.5">
                  {highRiskCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenEmergencyGuide}
              className="hidden xs:flex items-center gap-0.5 text-teal-200 hover:text-white transition px-1 py-0.5"
              title="คู่มือช่วยเหลือ 3 ส."
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-[11px]">คู่มือ 3ส.</span>
            </button>
          </div>
        </div>

        {/* Main App Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Logo & District Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md text-white border border-teal-400/30">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white flex items-center gap-1">
                  คนเชียงกลางไม่ทิ้งกัน
                </h1>
                <span className="text-[10px] bg-teal-700/80 text-teal-200 px-1.5 py-0.5 rounded border border-teal-600 font-normal">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-teal-200/90 leading-tight truncate">
                สสอ.เชียงกลาง • ดูแลใจด้วยใจ
              </p>
            </div>
          </div>

          {/* User Status & Jurisdiction Badge */}
          <div className="flex items-center gap-2">
            {/* Jurisdiction Tag */}
            <div className="hidden md:flex flex-col items-end text-xs">
              <div className="flex items-center gap-1 text-teal-100">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium">
                  {currentUser.role === 'ADMIN' ? 'ทุกตำบลใน อ.เชียงกลาง' : `ต.${currentUser.tambon}`}
                </span>
              </div>
              <div className="flex items-center gap-1 text-teal-300 text-[11px]">
                <Building2 className="w-3 h-3" />
                <span>{currentUser.hospital}</span>
              </div>
            </div>

            {/* Prominent Direct Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition border border-rose-500 cursor-pointer"
              title="ออกจากระบบ เพื่อกลับไปหน้าเข้าสู่ระบบ"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>

            {/* Profile Dropdown / Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-teal-700/70 hover:bg-teal-700 border border-teal-600/80 rounded-lg px-2.5 py-1.5 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {currentUser.role === 'ADMIN' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-200" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold leading-none truncate max-w-[130px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-teal-200 leading-tight mt-0.5 truncate max-w-[130px]">
                    {currentUser.role === 'ADMIN'
                      ? 'แอดมิน สสอ.'
                      : currentUser.role === 'HEALTH_OFFICER'
                      ? 'จนท. รพ.สต.'
                      : 'อสม. ประจำหมู่บ้าน'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-teal-300 ml-0.5" />
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

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenLogin();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>สลับบัญชีผู้ใช้ / ลงทะเบียนใหม่</span>
                    </button>
                  </div>
                </div>
              )}
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
