import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Building2, 
  MapPin, 
  Key, 
  Mail, 
  User as UserIcon,
  Phone
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
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'DEMO'>('LOGIN');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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
    const userFound = users.find(
      (u) =>
        u.username.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed
    );

    if (!userFound) {
      setLoginError('ไม่พบบัญชีผู้ใช้หรืออีเมลนี้ในระบบ');
      return;
    }

    if (userFound.password && loginPassword && userFound.password !== loginPassword) {
      setLoginError('รหัสผ่านไม่ถูกต้อง (หากลืมสามารถเลือกรหัสผ่านเริ่มต้น password123)');
      return;
    }

    onSelectUser(userFound);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regFullName.trim() || !regUsername.trim()) {
      setLoginError('กรุณากรอกชื่อ-สกุล และชื่อผู้ใช้ (Username)');
      return;
    }

    // Check duplicate
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === regUsername.trim().toLowerCase() ||
        (regEmail.trim() && u.email.toLowerCase() === regEmail.trim().toLowerCase())
    );

    if (exists) {
      setLoginError('ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานไปแล้ว');
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
    onSelectUser(newUser);
    setRegSuccess('ลงทะเบียนสำเร็จ เข้าสู่ระบบเรียบร้อยแล้ว!');
    setTimeout(() => {
      onClose();
    }, 1200);
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
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
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
          <button
            onClick={() => {
              setMode('DEMO');
              setLoginError('');
            }}
            className={`py-3 text-center transition ${
              mode === 'DEMO'
                ? 'bg-white text-teal-800 border-b-2 border-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
            ทดสอบสิทธิ์
          </button>
        </div>

        {/* Tab 1: LOGIN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username) หรือ อีเมล (E-mail)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="เช่น admin, officer_puea, หรือ thaipasit5@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน (รหัสเริ่มต้น: password123)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-500 text-xs">
              💡 <strong>คำแนะนำ:</strong> สามารถกดแท็บ <strong>"ทดสอบสิทธิ์"</strong> ด้านบน เพื่อเลือกเข้าสู่ระบบทันทีในบทบาท แอดมิน สสอ., จนท. รพ.สต. หรือ อสม.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          </form>
        )}

        {/* Tab 2: REGISTER FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs sm:text-sm">
            {loginError && (
              <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
                {loginError}
              </div>
            )}
            {regSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                {regSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="เช่น นางดวงใจ ปัญญาวงศ์"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="เช่น duangjai_vhv"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (E-mail)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="เช่น duangjai@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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

              {/* Role Selection */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทสมาชิก / สิทธิ์ในระบบ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('VHV')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      regRole === 'VHV'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    🌿 อสม. ประจำหมู่บ้าน
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('HEALTH_OFFICER')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      regRole === 'HEALTH_OFFICER'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-700 bg-white'
                    }`}
                  >
                    🏥 เจ้าหน้าที่ประจำ รพ.สต. (พี่เลี้ยง)
                  </button>
                </div>
              </div>

              {/* Area Scope (Tambon & Village) */}
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
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>ยืนยันการลงทะเบียนและเข้าใช้งาน</span>
            </button>
          </form>
        )}

        {/* Tab 3: QUICK DEMO ACCOUNTS */}
        {mode === 'DEMO' && (
          <div className="p-5 space-y-3">
            <p className="text-xs text-slate-600">
              คลิกเพื่อสลับเข้าใช้งานในบทบาทต่างๆ เพื่อทดสอบระบบสิทธิ์การเข้าถึงข้อมูลตามโจทย์:
            </p>

            <div className="space-y-2">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'HEALTH_OFFICER'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'ADMIN' ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <UserCheck className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.2 rounded-full">
                              ใช้งานอยู่
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.roleLabel} • {u.tambon === 'ทั้งหมด' ? 'ทั้งอำเภอเชียงกลาง' : `ต.${u.tambon}`}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-teal-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      เลือกบัญชีนี้
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
