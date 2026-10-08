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
  Database
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
  const [regRole, setRegRole] = useState<UserRole>('VHV');
  const [regTambon, setRegTambon] = useState<string>('เปือ');
  const [regVillage, setRegVillage] = useState<string>(
    CHIANG_KLANG_TAMBONS['เปือ']?.villages[0] || ''
  );
  const [regHospital, setRegHospital] = useState<string>(
    CHIANG_KLANG_TAMBONS['เปือ']?.hospitals[0] || ''
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
      setLoginError('ไม่พบบัญชีผู้ใช้หรืออีเมลนี้ในระบบ กรุณาตรวจสอบหรือลงทะเบียนใหม่');
      return;
    }

    if (userFound.password && loginPassword && userFound.password !== loginPassword) {
      setLoginError('รหัสผ่านไม่ถูกต้อง (หากไม่แน่ใจรหัสเริ่มต้นคือ password123)');
      return;
    }

    onLoginSuccess(userFound);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regFullName.trim() || !regUsername.trim()) {
      setRegError('กรุณากรอกชื่อ-สกุล และชื่อผู้ใช้ (Username)');
      return;
    }

    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === regUsername.trim().toLowerCase() ||
        (regEmail.trim() && u.email.toLowerCase() === regEmail.trim().toLowerCase())
    );

    if (exists) {
      setRegError('ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim().toLowerCase() || `${regUsername.trim()}@nanhealth.org`,
      password: regPassword || 'password123',
      fullName: regFullName.trim(),
      role: regRole,
      roleLabel:
        regRole === 'ADMIN'
          ? 'ผู้ดูแลระบบ สสอ.เชียงกลาง'
          : regRole === 'HEALTH_OFFICER'
          ? `เจ้าหน้าที่ ${regHospital} (พี่เลี้ยง)`
          : `อสม. ประจำ${regVillage}`,
      tambon: regTambon,
      village: regRole === 'HEALTH_OFFICER' ? `ทุกหมู่บ้านในตำบล${regTambon}` : regVillage,
      hospital: regHospital,
      phone: regPhone.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onRegisterUser(newUser);
    setRegSuccess('ลงทะเบียนสำเร็จ กำลังเข้าสู่ระบบ...');
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
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

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
                      placeholder="เช่น admin หรือ thaipasit5@gmail.com"
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
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
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

                <div className="relative my-2">
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

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('DEMO')}
                    className="text-xs text-teal-700 hover:underline font-semibold"
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
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      ชื่อ - สกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="เช่น นางสมศรี มะโนชัย"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="เช่น somsri_vhv"
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
                      placeholder="เช่น somsri@nanhealth.org"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      รหัสผ่าน (Password)
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="กำหนดรหัสผ่าน..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
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

                  {/* Role Selection */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      ประเภทสมาชิก / หน้าที่รับผิดชอบ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('VHV')}
                        className={`p-2 rounded-xl border text-xs text-left transition ${
                          regRole === 'VHV'
                            ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                            : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        🌿 อสม. ประจำหมู่บ้าน
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('HEALTH_OFFICER')}
                        className={`p-2 rounded-xl border text-xs text-left transition ${
                          regRole === 'HEALTH_OFFICER'
                            ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                            : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        🏥 จนท. รพ.สต. (พี่เลี้ยง)
                      </button>
                    </div>
                  </div>

                  {/* Area Scope (Tambon & Village) */}
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
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center justify-center gap-1.5 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>บันทึกการลงทะเบียนและเข้าใช้งาน</span>
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
