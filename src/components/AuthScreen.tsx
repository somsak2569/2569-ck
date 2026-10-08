import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { signInWithGoogle } from '../firebase';
import { 
  HeartHandshake, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Key, 
  Mail, 
  User as UserIcon, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Code,
  Building2,
  MapPin,
  Database,
  Crown
} from 'lucide-react';

interface AuthScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLoginSuccess,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'DEMO'>('LOGIN');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const email = fbUser.email?.toLowerCase() || '';
        let matchedUser = users.find(
          (u) => u.email.toLowerCase() === email || u.id === fbUser.uid
        );

        if (!matchedUser) {
          const isAdminEmail =
            email === 'thaipasit5@gmail.com' || email === 'som9999sak@gmail.com';
          matchedUser = {
            id: fbUser.uid,
            username: fbUser.email?.split('@')[0] || 'google_user',
            email: fbUser.email || '',
            password: 'password123',
            fullName: isAdminEmail
              ? 'อรไท พิพิธพัฒน์ไพสิธ'
              : fbUser.displayName || 'ผู้ใช้งาน Google',
            role: isAdminEmail ? 'ADMIN' : 'HEALTH_OFFICER',
            roleLabel: isAdminEmail
              ? 'ผู้ดูแลระบบ สสอ.เชียงกลาง'
              : 'เจ้าหน้าที่สาธารณสุข (Google)',
            tambon: 'เชียงกลาง',
            village: 'ทั้งหมด',
            hospital: 'สสอ.เชียงกลาง',
            phone: fbUser.phoneNumber || (isAdminEmail ? '0979184142' : '-'),
            createdAt: new Date().toISOString().slice(0, 10),
          };
          onRegisterUser(matchedUser);
        }
        onLoginSuccess(matchedUser);
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setLoginError(
        'ไม่สามารถเข้าสู่ระบบด้วย Google ได้: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
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
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

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
      setLoginError('ไม่พบบัญชีผู้ใช้หรืออีเมลนี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือลงทะเบียนใหม่');
      return;
    }

    if (userFound.password) {
      if (!loginPassword) {
        setLoginError('กรุณากรอกรหัสผ่านสำหรับการเข้าสู่ระบบ');
        return;
      }
      if (userFound.password !== loginPassword) {
        setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
        return;
      }
    }

    onLoginSuccess(userFound);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const trimmedName = regFullName.trim();
    const trimmedUsername = regUsername.trim().toLowerCase();

    if (!trimmedName || !trimmedUsername) {
      setRegError('กรุณากรอกชื่อ-สกุล และชื่อผู้ใช้ (Username)');
      return;
    }

    if (trimmedUsername.length < 3) {
      setRegError('ชื่อผู้ใช้ (Username) ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }

    if (!/^[a-zA-Z0-9_\-]+$/.test(trimmedUsername)) {
      setRegError('ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข ขีดล่าง หรือยัติภังค์เท่านั้น (ห้ามเว้นวรรค)');
      return;
    }

    if (!regPassword) {
      setRegError('กรุณากำหนดรหัสผ่าน (Password) สำหรับใช้ในการเข้าสู่ระบบ');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    // Admin passcode check
    if (regRole === 'ADMIN' && adminPasscode.trim()) {
      const allowedCodes = ['admin2569', '2569', 'admin', 'ck2569', 'สสอ.เชียงกลาง'];
      if (!allowedCodes.includes(adminPasscode.trim().toLowerCase())) {
        setRegError('รหัสยืนยันผู้ดูแลระบบ (Admin Passcode) ไม่ถูกต้อง (ระบุ: admin2569)');
        return;
      }
    }

    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === trimmedUsername ||
        (regEmail.trim() && u.email.toLowerCase() === regEmail.trim().toLowerCase())
    );

    if (exists) {
      setRegError('ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
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
      email:
        regEmail.trim().toLowerCase() ||
        (isAdmin
          ? `${trimmedUsername}@chiangklang.nan.go.th`
          : `${trimmedUsername}@nanhealth.org`),
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
    setRegSuccess(
      `ลงทะเบียนสำเร็จ! เข้าสู่ระบบในชื่อ ${newUser.fullName} (${newUser.roleLabel})`
    );
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex flex-col justify-between py-6 px-3 sm:px-6">
      {/* Top Banner & App Identity */}
      <div className="max-w-md w-full mx-auto my-auto space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="text-center space-y-2">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-xl text-white border-2 border-teal-300/40 mx-auto">
            <HeartHandshake className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              คนเชียงกลางไม่ทิ้งกัน
            </h1>
            <p className="text-xs sm:text-sm text-teal-200 font-medium">
              สำนักงานสาธารณสุขอำเภอเชียงกลาง จังหวัดน่าน
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <span className="bg-teal-800/80 backdrop-blur-xs border border-teal-600/70 text-teal-100 text-[11px] px-3 py-0.5 rounded-full font-semibold">
                ระบบประเมินและคัดกรองความเสี่ยงการฆ่าตัวตาย (2Q Plus & 8Q)
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Firebase: <strong>2569-ck</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Segmented Tab Header */}
          <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('LOGIN');
                setLoginError('');
              }}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('REGISTER');
                setRegError('');
                setRegSuccess('');
              }}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'REGISTER'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ลงทะเบียน</span>
            </button>
            <button
              onClick={() => setActiveTab('DEMO')}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'DEMO'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ทดสอบสิทธิ์</span>
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {/* TAB 1: LOGIN */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Admin Quick Fill Banner */}
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <span>เข้าสู่ระบบผู้ดูแลระบบ (Admin)</span>
                        <span className="text-[10px] bg-amber-200/90 text-amber-900 font-bold px-1.5 py-0.2 rounded-md shrink-0">สสอ.</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Username: <span className="font-mono font-bold text-slate-700">admin</span> • รหัส: <span className="font-mono text-slate-700">password123</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput('admin');
                      setLoginPassword('password123');
                      setLoginError('');
                    }}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                  >
                    ใช้บัญชีนี้
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username) หรือ อีเมล (E-mail)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="เช่น admin หรือ som9999sak หรือ username ที่ลงทะเบียน"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none bg-slate-50/50 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      รหัสผ่าน (Password)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      รหัสเริ่มต้น: password123
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ..."
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
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('REGISTER');
                      setRegRole('ADMIN');
                      setRegError('');
                      setRegSuccess('');
                    }}
                    className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>ลงทะเบียนผู้ดูแลระบบใหม่ (Admin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('REGISTER');
                      setRegRole('VHV');
                      setRegError('');
                      setRegSuccess('');
                    }}
                    className="text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
                  >
                    + ลงทะเบียน อสม./จนท.
                  </button>
                </div>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-white px-2 text-slate-400 font-medium">หรือ เข้าสู่ระบบด้วย</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-xs transition text-xs sm:text-sm flex items-center justify-center gap-2.5 hover:border-teal-500 cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isGoogleLoading ? 'กำลังเข้าสู่ระบบ Google...' : 'เข้าสู่ระบบด้วย Google (Firebase 2569-ck)'}</span>
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('DEMO')}
                    className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
                  >
                    ⚡ คลิกที่นี่เพื่อเลือกเข้าใช้งานทันทีด้วยบัญชีทดสอบ
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {regError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Role Selection */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">
                      ประเภทสมาชิก / สิทธิ์การใช้งาน <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('ADMIN')}
                        className={`p-2.5 rounded-xl border text-xs text-left transition cursor-pointer flex flex-col justify-between ${
                          regRole === 'ADMIN'
                            ? 'border-amber-500 bg-amber-50/90 text-amber-900 font-bold ring-2 ring-amber-400/40 shadow-xs'
                            : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>ผู้ดูแลระบบ (Admin)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">
                          สสอ.เชียงกลาง (ทุกตำบล)
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
                          ระดับตำบล / รพ.สต.
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
                          ผู้คัดกรอง 2Q+ & 8Q
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Admin Specific Privileges & Passcode */}
                  {regRole === 'ADMIN' && (
                    <div className="sm:col-span-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-900 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>สิทธิ์ผู้ดูแลระบบระดับอำเภอ สสอ.เชียงกลาง (District Admin)</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        • สังกัด: สำนักงานสาธารณสุขอำเภอเชียงกลาง (สสอ.เชียงกลาง)<br />
                        • ขอบเขต: ดูแลและจัดการข้อมูลครอบคลุมทั้ง 6 ตำบล และ 61 หมู่บ้าน<br />
                        • สิทธิ์พิเศษ: ตรวจสอบข้อมูลผู้ป่วยทั้งหมด, จัดการสมาชิก, ดาวน์โหลดรายงาน Excel
                      </p>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-amber-900 text-[11px]">
                            รหัสยืนยันผู้ดูแลระบบ (Admin Passcode)
                          </label>
                          <span className="text-[10px] text-amber-700 bg-amber-200/70 px-1.5 py-0.5 rounded font-medium">
                            รหัสความปลอดภัย: admin2569
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminPasscode}
                            onChange={(e) => setAdminPasscode(e.target.value)}
                            placeholder="กรอก admin2569"
                            className="flex-1 px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setAdminPasscode('admin2569')}
                            className="px-2.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer"
                          >
                            ใช้รหัสมาตรฐาน
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      ชื่อ - สกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={regRole === 'ADMIN' ? 'เช่น นายสมศักดิ์ สุทธการ' : 'เช่น นางสมศรี มะโนชัย'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">
                        ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">สำหรับ Login</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder={regRole === 'ADMIN' ? 'เช่น somsak_admin หรือ admin_ck' : 'เช่น somsri_vhv'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      อีเมล (E-mail)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={regRole === 'ADMIN' ? 'เช่น somsak@chiangklang.nan.go.th' : 'เช่น somsri@nanhealth.org'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">
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
                        placeholder="กำหนดรหัสผ่านของคุณ..."
                        className="w-full px-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-slate-700">
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
                        placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง..."
                        className="w-full px-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์มือถือ
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="เช่น 081-234-5678"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Area Scope (Tambon & Village / Hospital) */}
                  {regRole !== 'ADMIN' ? (
                    <>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          ตำบลใน อ.เชียงกลาง
                        </label>
                        <select
                          value={regTambon}
                          onChange={(e) => handleTambonChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none font-medium"
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
                          <label className="block font-bold text-slate-700 mb-1">
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
                          <label className="block font-bold text-slate-700 mb-1">
                            รพ.สต. สังกัด
                          </label>
                          <select
                            value={regHospital}
                            onChange={(e) => setRegHospital(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none font-medium"
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
                        <strong>พื้นที่รับผิดชอบ:</strong> ทั้ง 6 ตำบลใน อ.เชียงกลาง
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>บันทึกการลงทะเบียนและเข้าใช้งานทันที</span>
                </button>
              </form>
            )}

            {/* TAB 3: DEMO QUICK LOGIN */}
            {activeTab === 'DEMO' && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-600 mb-2">
                  คลิกที่บัญชีผู้ใช้เพื่อเข้าสู่ระบบทันที เพื่อทดสอบสิทธิ์การเข้าถึงข้อมูลตามเขตพื้นที่:
                </p>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => onLoginSuccess(u)}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'HEALTH_OFFICER'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role === 'ADMIN' ? (
                            <ShieldCheck className="w-4 h-4 text-amber-700" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-teal-700" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-900 text-xs group-hover:text-teal-800">
                            {u.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {u.roleLabel} • {u.tambon === 'ทั้งหมด' ? 'ทั้งอำเภอเชียงกลาง' : `ต.${u.tambon}`}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] bg-teal-50 group-hover:bg-teal-700 group-hover:text-white text-teal-800 font-semibold px-2 py-1 rounded-lg border border-teal-200 transition shrink-0">
                        เลือกบัญชีนี้
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
