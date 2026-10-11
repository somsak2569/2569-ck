import React, { useState } from 'react';
import {
  LogIn,
  HeartHandshake,
  Key,
  Eye,
  EyeOff,
  User as UserIcon,
  AlertCircle,
  PhoneCall,
  ShieldCheck,
  UserPlus,
  ArrowLeft,
  Building2,
  MapPin,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { isUserSomsak, verifyUserPassword } from '../utils/storage';
import { fetchUsersFromFirestore } from '../services/firestoreSync';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { PWAInstallButton } from './PWAInstallButton';

interface AuthScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterUser?: (newUser: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER_ADMIN' | 'REGISTER_OFFICER_VHV';

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLoginSuccess,
  onRegisterUser,
}) => {
  // Current view mode: LOGIN, REGISTER_ADMIN, or REGISTER_OFFICER_VHV
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState<'ADMIN' | 'HEALTH_OFFICER' | 'VHV'>('HEALTH_OFFICER');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regTambon, setRegTambon] = useState('เชียงกลาง');
  const [regVillage, setRegVillage] = useState(
    CHIANG_KLANG_TAMBONS['เชียงกลาง']?.villages[0] || 'หมู่ 1 บ้านศรีอุดม'
  );
  const [regHospital, setRegHospital] = useState(
    CHIANG_KLANG_TAMBONS['เชียงกลาง']?.hospitals[0] || 'รพ.สต.บ้านงิ้ว'
  );
  const [regSuccess, setRegSuccess] = useState('');

  const handleTambonChange = (newTambon: string) => {
    setRegTambon(newTambon);
    const vList = CHIANG_KLANG_TAMBONS[newTambon]?.villages || [];
    const hList = CHIANG_KLANG_TAMBONS[newTambon]?.hospitals || [];
    if (vList.length > 0) setRegVillage(vList[0]);
    if (hList.length > 0) setRegHospital(hList[0]);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const rawInput = loginInput.trim();
    const trimmed = rawInput.toLowerCase();
    if (!trimmed) {
      setLoginError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }

    const cleanUsers = users.filter((u) => !isUserSomsak(u));

    // Flexible matching for Thai names, usernames, phones, emails, and admin aliases
    const cleanDigits = rawInput.replace(/[^0-9]/g, '');
    const matchUser = (u: User) => {
      if (isUserSomsak(u)) return false;
      const uName = (u.username || '').toLowerCase().trim();
      const uEmail = (u.email || '').toLowerCase().trim();
      const uFull = (u.fullName || '').toLowerCase().trim();
      const uPhoneDigits = (u.phone || '').replace(/[^0-9]/g, '');

      // 1. Exact username
      if (uName === trimmed) return true;
      // 2. Exact email
      if (uEmail && uEmail === trimmed) return true;
      // 3. Exact full name
      if (uFull === trimmed) return true;
      // 4. Phone number match
      if (cleanDigits.length >= 8 && uPhoneDigits.endsWith(cleanDigits)) return true;

      // 5. Admin keywords
      const isAdminTerm =
        trimmed === 'admin' ||
        trimmed === 'admin2569' ||
        trimmed === 'ผู้ดูแลระบบ' ||
        trimmed === 'แอดมิน' ||
        trimmed === 'ck2569' ||
        trimmed === 'สสอ.เชียงกลาง' ||
        trimmed === 'thaipasit5@gmail.com';
      if (isAdminTerm && (u.role === 'ADMIN' || uName === 'admin')) return true;

      // 6. Partial Thai name or username containment
      if (trimmed.length >= 3) {
        if (uFull.includes(trimmed) || trimmed.includes(uFull)) return true;
        if (trimmed.includes(uName) || (uName.length >= 3 && uName.includes(trimmed))) return true;
      }

      return false;
    };

    let userFound = cleanUsers.find(matchUser);

    // Fallback 1: Search INITIAL_USERS
    if (!userFound) {
      userFound = INITIAL_USERS.find(matchUser);
    }

    // Fallback 2: Direct Firestore fetch for cloud updates
    if (!userFound) {
      try {
        const cloudUsers = await fetchUsersFromFirestore();
        if (cloudUsers && cloudUsers.length > 0) {
          const freshClean = cloudUsers.filter((u) => !isUserSomsak(u));
          userFound = freshClean.find(matchUser);
        }
      } catch (err) {
        console.warn('Direct Firestore fetch check error:', err);
      }
    }

    if (!userFound) {
      setLoginError('ไม่พบบัญชีผู้ใช้หรืออีเมลนี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือเลือกลงทะเบียนใหม่ที่ด้านล่าง');
      return;
    }

    if (userFound.password) {
      if (!loginPassword) {
        setLoginError('กรุณากรอกรหัสผ่านสำหรับการเข้าสู่ระบบ');
        return;
      }
      if (!verifyUserPassword(userFound, loginPassword)) {
        setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        return;
      }
    }

    onLoginSuccess(userFound);
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

    // Duplicate check
    const isDuplicate = [...users, ...INITIAL_USERS].some(
      (u) => !isUserSomsak(u) && (u.username || '').toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (isDuplicate) {
      setLoginError('ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
      return;
    }

    const isAdmin = authMode === 'REGISTER_ADMIN';
    const activeRole = isAdmin ? 'ADMIN' : regRole;
    const isOfficer = activeRole === 'HEALTH_OFFICER';

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
      role: activeRole,
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

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }
    setRegSuccess(`ลงทะเบียน ${newUser.fullName} เรียบร้อยแล้ว กำลังเข้าสู่ระบบ...`);
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  const switchToMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setLoginError('');
    setRegSuccess('');
    if (mode === 'REGISTER_ADMIN') {
      setRegRole('ADMIN');
    } else if (mode === 'REGISTER_OFFICER_VHV') {
      setRegRole('HEALTH_OFFICER');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex flex-col justify-between py-6 px-3 sm:px-6">
      {/* Top Banner & App Identity */}
      <div className="max-w-md w-full mx-auto my-auto space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="text-center space-y-1.5">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-xl text-white border-2 border-teal-300/40 mx-auto">
            <HeartHandshake className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              คนเชียงกลางไม่ทิ้งกัน
            </h1>
            <p className="text-xs sm:text-sm text-teal-200 font-medium">
              สำนักงานสาธารณสุขอำเภอเชียงกลาง จังหวัดน่าน
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              <span className="bg-teal-800/80 backdrop-blur-xs border border-teal-600/70 text-teal-100 text-[11px] px-3 py-0.5 rounded-full font-semibold">
                ระบบประเมินและคัดกรองความเสี่ยงการฆ่าตัวตาย (2Q Plus & 8Q)
              </span>
            </div>
          </div>
        </div>

        {/* Auth Frame / Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Frame Header */}
          {authMode === 'LOGIN' ? (
            <div className="bg-gradient-to-r from-teal-800 to-teal-700 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base leading-tight">เข้าสู่ระบบบุคลากร</h2>
                  <p className="text-[11px] text-teal-200">สสอ.เชียงกลาง • รพ.สต. • อสม. ประจำหมู่บ้าน</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-teal-900/60 border border-teal-500/30 px-2.5 py-1 rounded-full text-[11px] text-teal-100 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>ความปลอดภัยสูง</span>
              </div>
            </div>
          ) : authMode === 'REGISTER_ADMIN' ? (
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => switchToMode('LOGIN')}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                  title="กลับไปหน้าเข้าสู่ระบบ"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-200" />
                </button>
                <div>
                  <h2 className="font-bold text-sm sm:text-base leading-tight">ลงทะเบียน ผู้ดูแลระบบ (Admin)</h2>
                  <p className="text-[11px] text-indigo-200">สสอ.เชียงกลาง (ครอบคลุมทั้ง 6 ตำบล)</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-indigo-950/70 border border-indigo-400/40 px-2.5 py-1 rounded-full text-[11px] text-amber-300 font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>สิทธิ์ ADMIN</span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-teal-800 to-emerald-800 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => switchToMode('LOGIN')}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                  title="กลับไปหน้าเข้าสู่ระบบ"
                >
                  <ArrowLeft className="w-4 h-4 text-teal-200" />
                </button>
                <div>
                  <h2 className="font-bold text-sm sm:text-base leading-tight">ลงทะเบียน เจ้าหน้าที่ รพ.สต. / อสม.</h2>
                  <p className="text-[11px] text-teal-200">บุคลากรประจำตำบลและหมู่บ้าน อ.เชียงกลาง</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-teal-950/70 border border-teal-400/40 px-2.5 py-1 rounded-full text-[11px] text-emerald-200 font-bold">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-300" />
                <span>พื้นที่ดูแล</span>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          <div className="px-5 sm:px-6 pt-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}
            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}
          </div>

          {/* Frame Main Content */}
          {authMode === 'LOGIN' ? (
            /* ------------------ VIEW 1: LOGIN ------------------ */
            <div>
              <div className="p-5 sm:p-6 pt-2">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อผู้ใช้งาน (Username) หรือเบอร์โทรศัพท์
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        placeholder="เช่น admin หรือ ชื่อผู้ใช้งาน / เบอร์โทรศัพท์"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none bg-slate-50/50 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        รหัสผ่าน (Password)
                      </label>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="กรอกรหัสผ่านของคุณ"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none bg-slate-50/50 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ</span>
                  </button>
                </form>
              </div>

              {/* ส่วนท้ายของเฟรม: เมนูลงทะเบียนใหม่ (แยก Admin และ รพ.สต./อสม.) */}
              <div className="border-t border-slate-200 bg-slate-50/90 p-4 sm:p-5 rounded-b-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <UserPlus className="w-4 h-4 text-teal-700" />
                    <span>เมนูลงทะเบียนใหม่</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    เลือกลงทะเบียนตามส่วนงาน
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* ส่วนที่ 1: ส่วนลงทะเบียนของ Admin */}
                  <button
                    type="button"
                    onClick={() => switchToMode('REGISTER_ADMIN')}
                    className="flex items-start gap-2.5 p-3 rounded-2xl border-2 border-indigo-200 bg-white hover:bg-indigo-50/80 hover:border-indigo-400 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                        <span>ลงทะเบียน Admin</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">สสอ.</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        ผู้ดูแลระบบ สสอ.เชียงกลาง (ครอบคลุมทั้ง 6 ตำบล)
                      </p>
                    </div>
                  </button>

                  {/* ส่วนที่ 2: ส่วนลงทะเบียนของ เจ้าหน้าที่ รพ.สต/เจ้าหน้าที่ อสม. */}
                  <button
                    type="button"
                    onClick={() => switchToMode('REGISTER_OFFICER_VHV')}
                    className="flex items-start gap-2.5 p-3 rounded-2xl border-2 border-teal-200 bg-white hover:bg-teal-50/80 hover:border-teal-400 text-left transition shadow-xs cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-100 group-hover:bg-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                      <HeartHandshake className="w-5 h-5 text-teal-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-teal-950 flex items-center gap-1">
                        <span>ลงทะเบียน รพ.สต. / อสม.</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        จนท. รพ.สต. (พี่เลี้ยง) และ อสม.ประจำหมู่บ้าน
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : authMode === 'REGISTER_ADMIN' ? (
            /* ------------------ VIEW 2: REGISTER ADMIN ------------------ */
            <div>
              <div className="p-5 sm:p-6 pt-2">
                {/* Admin Privileges Info Banner */}
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>ส่วนลงทะเบียนผู้ดูแลระบบ สสอ.เชียงกลาง</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    สิทธิระดับแอดมินสามารถเข้าถึงข้อมูลสถิติภาพรวม, ข้อมูลผู้ป่วย, ผลคัดกรอง 2Q+ / 8Q และจัดการสมาชิกได้ครบทุกตำบล
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="เช่น นายอนุชา บริสุทธิ์ หรือ น.ส.สมใจ ดีงาม"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium border border-indigo-200">
                        ใช้ภาษาไทย ภาษาอังกฤษ หรือตัวเลขได้
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="เช่น admin_ck หรือ แอดมินสสอ"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="เช่น 081-999-8888"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          รหัสผ่าน <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">ขั้นต่ำ 4 ตัว</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="กำหนดรหัสผ่าน"
                          className="w-full px-3 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                        </label>
                        {regConfirmPassword && (
                          <span
                            className={`text-[10px] font-bold ${
                              regPassword === regConfirmPassword ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {regPassword === regConfirmPassword ? '✓ ตรงกัน' : '✗ ไม่ตรง'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="พิมพ์รหัสผ่านซ้ำ"
                          className="w-full px-3 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Agency info */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                    <div>
                      <strong>หน่วยงาน:</strong> สสอ.เชียงกลาง
                    </div>
                    <div>
                      <strong>พื้นที่กำกับ:</strong> ครอบคลุมทั้ง 6 ตำบล
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>ยืนยันการลงทะเบียน Admin และเข้าใช้งานทันที</span>
                  </button>
                </form>
              </div>

              {/* ส่วนท้ายของเฟรม: ปุ่มสลับและกลับ */}
              <div className="border-t border-slate-200 bg-slate-50/90 p-4 sm:p-5 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => switchToMode('REGISTER_OFFICER_VHV')}
                  className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>สลับไปลงทะเบียน เจ้าหน้าที่ รพ.สต. / อสม.</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchToMode('LOGIN')}
                  className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับไปหน้าเข้าสู่ระบบ</span>
                </button>
              </div>
            </div>
          ) : (
            /* ------------------ VIEW 3: REGISTER OFFICER / VHV ------------------ */
            <div>
              <div className="p-5 sm:p-6 pt-2">
                {/* Role Switcher Tabs */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    เลือกบทบาทการลงทะเบียน <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setRegRole('HEALTH_OFFICER')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        regRole === 'HEALTH_OFFICER'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>เจ้าหน้าที่ รพ.สต.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('VHV')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        regRole === 'VHV'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>เจ้าหน้าที่ อสม.</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Tambon & Facility / Village Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-700" />
                        <span>ตำบลใน อ.เชียงกลาง</span>
                      </label>
                      <select
                        value={regTambon}
                        onChange={(e) => handleTambonChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500"
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
                        <label className="block text-xs font-bold text-teal-900 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          <span>หมู่บ้านที่รับผิดชอบ</span>
                        </label>
                        <select
                          value={regVillage}
                          onChange={(e) => setRegVillage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500"
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
                        <label className="block text-xs font-bold text-teal-900 mb-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-teal-700" />
                          <span>รพ.สต. สังกัด</span>
                        </label>
                        <select
                          value={regHospital}
                          onChange={(e) => setRegHospital(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {CHIANG_KLANG_TAMBONS[regTambon]?.hospitals.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={
                        regRole === 'HEALTH_OFFICER'
                          ? 'เช่น พว.สุภาวดี ใจกว้าง หรือ นายธีรภัทร ชัยชนะ'
                          : 'เช่น นายคำปัน มหาวงศ์ หรือ นางสมร ดีใจ'
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200">
                        ใช้ภาษาไทย ภาษาอังกฤษ หรือตัวเลขได้
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder={
                        regRole === 'HEALTH_OFFICER'
                          ? 'เช่น สุภาวดี หรือ officer_puea'
                          : 'เช่น คำปัน หรือ สมร หรือ อสม_ดวงใจ'
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="เช่น 089-755-1234"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          รหัสผ่าน <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">อย่างน้อย 4 ตัว</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="กำหนดรหัสผ่าน"
                          className="w-full px-3 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                        </label>
                        {regConfirmPassword && (
                          <span
                            className={`text-[10px] font-bold ${
                              regPassword === regConfirmPassword ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {regPassword === regConfirmPassword ? '✓ ตรงกัน' : '✗ ไม่ตรง'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="พิมพ์รหัสผ่านซ้ำ"
                          className="w-full px-3 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>ยืนยันการลงทะเบียนและเข้าใช้งานทันที</span>
                  </button>
                </form>
              </div>

              {/* ส่วนท้ายของเฟรม: ปุ่มสลับและกลับ */}
              <div className="border-t border-slate-200 bg-slate-50/90 p-4 sm:p-5 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => switchToMode('REGISTER_ADMIN')}
                  className="text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>สลับไปลงทะเบียน ผู้ดูแลระบบ (Admin สสอ.)</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchToMode('LOGIN')}
                  className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับไปหน้าเข้าสู่ระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PWA Cross-Platform Install Card */}
        <PWAInstallButton variant="card" />

        {/* Emergency Hotline Strip */}
        <div className="bg-teal-950/60 backdrop-blur-md rounded-2xl p-3 border border-teal-700/50 flex items-center justify-between text-xs text-teal-100">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
            <span>สายด่วนสุขภาพจิต 24 ชม.</span>
          </div>
          <a
            href="tel:1323"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg transition text-xs"
          >
            โทร 1323
          </a>
        </div>
      </div>

      {/* Footer Credit */}
      <div className="text-center text-teal-300/80 text-xs py-2 mt-4 space-y-0.5">
        <div>
          ระบบ “คนเชียงกลางไม่ทิ้งกัน” สำนักงานสาธารณสุขอำเภอเชียงกลาง จังหวัดน่าน
        </div>
        <div className="font-semibold text-amber-300">
          ผู้พัฒนาระบบ: สมศักดิ์ สุทธการ
        </div>
      </div>
    </div>
  );
};
