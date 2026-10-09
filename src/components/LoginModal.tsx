import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  MapPin, 
  Key, 
  Mail, 
  User as UserIcon,
  Phone,
  Crown,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onRegisterUser: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onRegisterUser,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('admin2569');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');
  const [regTambon, setRegTambon] = useState<string>('เชียงกลาง');
  const [regVillage, setRegVillage] = useState<string>(
    CHIANG_KLANG_TAMBONS['เชียงกลาง']?.villages[0] || 'หมู่ 1 บ้านศรีอุดม'
  );
  const [regHospital, setRegHospital] = useState<string>(
    CHIANG_KLANG_TAMBONS['เชียงกลาง']?.hospitals[0] || 'สสอ.เชียงกลาง'
  );
  const [regPhone, setRegPhone] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  const handleTambonChange = (newTambon: string) => {
    setRegTambon(newTambon);
    const vList = CHIANG_KLANG_TAMBONS[newTambon]?.villages || [];
    setRegVillage(vList[0] || '');
    const hList = CHIANG_KLANG_TAMBONS[newTambon]?.hospitals || [];
    setRegHospital(hList[0] || '');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmed = loginInput.trim().toLowerCase();
    if (!trimmed) {
      setLoginError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }

    const userFound = users.find(
      (u) =>
        u.username.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed
    );

    if (!userFound) {
      setLoginError('ไม่พบบัญชีผู้ใช้หรืออีเมลนี้ในระบบ กรุณาตรวจสอบหรือลงทะเบียนใหม่');
      return;
    }

    if (userFound.password) {
      if (!loginPassword) {
        setLoginError('กรุณากรอกรหัสผ่าน');
        return;
      }
      if (userFound.password !== loginPassword) {
        setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        return;
      }
    }

    onSelectUser(userFound);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegSuccess('');

    const trimmedName = regFullName.trim();
    const trimmedUsername = regUsername.trim();

    if (!trimmedName || !trimmedUsername) {
      setLoginError('กรุณากรอกชื่อ-สกุล และชื่อผู้ใช้ (Username)');
      return;
    }

    if (trimmedUsername.length < 2) {
      setLoginError('ชื่อผู้ใช้ (Username) ต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
      return;
    }

    // Allow Thai alphabet, English letters, digits, underscore, hyphen (no whitespace)
    if (!/^[a-zA-Z0-9_\-\u0E00-\u0E7F]+$/.test(trimmedUsername)) {
      setLoginError('ชื่อผู้ใช้สามารถใช้ตัวอักษรภาษาไทย ภาษาอังกฤษ ตัวเลข ขีดล่าง หรือยัติภังค์ (ห้ามเว้นวรรค)');
      return;
    }

    if (!regPassword) {
      setLoginError('กรุณากำหนดรหัสผ่านสำหรับการเข้าสู่ระบบ');
      return;
    }

    if (regPassword.length < 4) {
      setLoginError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLoginError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    // Check duplicate
    const exists = users.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (exists) {
      setLoginError('ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
      return;
    }

    const isAdmin = regRole === 'ADMIN';
    const isOfficer = regRole === 'HEALTH_OFFICER';

    const newUser: User = {
      id: isAdmin
        ? `admin-${Date.now()}`
        : isOfficer
        ? `officer-${Date.now()}`
        : `vhv-${Date.now()}`,
      username: trimmedUsername,
      email: '',
      password: regPassword,
      fullName: trimmedName,
      role: regRole,
      roleLabel: isAdmin
        ? 'ผู้ดูแลระบบ สสอ.เชียงกลาง'
        : isOfficer
        ? `เจ้าหน้าที่ ${regHospital} (พี่เลี้ยง)`
        : `อสม. ประจำ${regVillage}`,
      tambon: isAdmin ? 'ทั้งหมด' : regTambon,
      village: isAdmin
        ? 'ทั้งหมด'
        : isOfficer
        ? `ทุกหมู่บ้านในตำบล${regTambon}`
        : regVillage,
      hospital: isAdmin ? 'สสอ.เชียงกลาง' : regHospital,
      phone: regPhone.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onRegisterUser(newUser);
    onSelectUser(newUser);
    setRegSuccess('ลงทะเบียนสำเร็จ เข้าสู่ระบบเรียบร้อยแล้ว!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="bg-teal-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">เข้าสู่ระบบ / ลงทะเบียนผู้ใช้งาน</h2>
            <p className="text-xs text-teal-200 mt-0.5">
              ระบบ “คนเชียงกลางไม่ทิ้งกัน” สสอ.เชียงกลาง จ.น่าน
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('LOGIN');
              setLoginError('');
            }}
            className={`py-3 text-center transition ${
              mode === 'LOGIN'
                ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1" />
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => {
              setMode('REGISTER');
              setLoginError('');
            }}
            className={`py-3 text-center transition ${
              mode === 'REGISTER'
                ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1" />
            ลงทะเบียนใหม่
          </button>
        </div>

        {/* Tab 1: LOGIN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-3.5 text-xs sm:text-sm">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="เช่น admin หรือ ชื่อผู้ใช้ที่ลงทะเบียน"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่าน (Password)
                </label>
                <span className="text-[11px] text-slate-400">
                  รหัสผ่านของคุณ
                </span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setRegRole('ADMIN');
                  setLoginError('');
                }}
                className="text-amber-700 hover:text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>ลงทะเบียน Admin ใหม่</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setRegRole('VHV');
                  setLoginError('');
                }}
                className="text-teal-700 hover:text-teal-800 font-semibold hover:underline cursor-pointer"
              >
                + ลงทะเบียน อสม./จนท.
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: REGISTER FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs sm:text-sm">
            {loginError && (
              <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}
            {regSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <span>{regSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Role Selection */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ประเภทสมาชิก / สิทธิ์การใช้งาน <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition cursor-pointer flex flex-col justify-between ${
                      regRole === 'ADMIN'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                      <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>ผู้ดูแลระบบ (Admin)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      สสอ.เชียงกลาง
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('HEALTH_OFFICER')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition cursor-pointer flex flex-col justify-between ${
                      regRole === 'HEALTH_OFFICER'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-400/40 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>จนท. รพ.สต. (พี่เลี้ยง)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      ประจำตำบล
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('VHV')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition cursor-pointer flex flex-col justify-between ${
                      regRole === 'VHV'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400/40 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>อสม. ประจำหมู่บ้าน</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      ผู้คัดกรอง 2Q+
                    </span>
                  </button>
                </div>
              </div>

              {/* Admin Privileges Info */}
              {regRole === 'ADMIN' && (
                <div className="sm:col-span-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>สิทธิ์ผู้ดูแลระบบ สสอ.เชียงกลาง (ครอบคลุมทั้ง 6 ตำบล)</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    สามารถเข้าถึงข้อมูลผู้ป่วย สถิติ และสมาชิก อสม. ได้ครบทุกตำบลในอำเภอเชียงกลาง
                  </p>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={regRole === 'ADMIN' ? 'เช่น นายสมศักดิ์ สุทธการ' : 'เช่น นางดวงใจ ปัญญาวงศ์'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-medium border border-teal-200">
                    ใช้ภาษาไทย ภาษาอังกฤษ หรือตัวเลขได้
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder={regRole === 'ADMIN' ? 'เช่น แอดมินสสอ หรือ somsak_admin' : 'เช่น อสมดวงใจ หรือ duangjai_vhv'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Password & Confirm */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">อย่างน้อย 4 ตัว</span>
                </div>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่าน..."
                    className="w-full px-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  {regConfirmPassword && (
                    <span className={`text-[10px] font-bold ${regPassword === regConfirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {regPassword === regConfirmPassword ? '✓ ตรงกัน' : '✗ ไม่ตรงกัน'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="พิมพ์ซ้ำอีกครั้ง..."
                    className="w-full px-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="เช่น 081-999-8888"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Area Scope (Tambon & Village / Hospital) */}
              {regRole !== 'ADMIN' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ตำบลใน อ.เชียงกลาง
                    </label>
                    <select
                      value={regTambon}
                      onChange={(e) => handleTambonChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                    >
                      {Object.keys(CHIANG_KLANG_TAMBONS).map((t) => (
                        <option key={t} value={t}>
                          ตำบล{t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {regRole === 'VHV' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        หมู่บ้านที่รับผิดชอบ
                      </label>
                      <select
                        value={regVillage}
                        onChange={(e) => setRegVillage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                      >
                        {CHIANG_KLANG_TAMBONS[regTambon]?.villages.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        รพ.สต. สังกัด
                      </label>
                      <select
                        value={regHospital}
                        onChange={(e) => setRegHospital(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                      >
                        {CHIANG_KLANG_TAMBONS[regTambon]?.hospitals.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <div className="sm:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                  <div>
                    <strong>หน่วยงาน:</strong> สสอ.เชียงกลาง
                  </div>
                  <div>
                    <strong>พื้นที่:</strong> ทั้ง 6 ตำบลใน อ.เชียงกลาง
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ยืนยันการลงทะเบียนและเข้าใช้งานทันที</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
