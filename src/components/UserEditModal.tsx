import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { CHIANG_KLANG_TAMBONS, ALL_HEALTH_FACILITIES } from '../data/chiangklangData';
import { 
  X, 
  Save, 
  Crown, 
  ShieldCheck, 
  UserCheck, 
  User as UserIcon, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  AlertCircle 
} from 'lucide-react';

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  currentUser: User;
  allUsers: User[];
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  currentUser,
  allUsers,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('VHV');
  const [tambon, setTambon] = useState('เชียงกลาง');
  const [village, setVillage] = useState('');
  const [hospital, setHospital] = useState<string>(ALL_HEALTH_FACILITIES[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setPassword(user.password || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'VHV');
      setTambon(user.tambon || 'เชียงกลาง');
      setVillage(user.village || '');
      setHospital(user.hospital || ALL_HEALTH_FACILITIES[0]);
      setError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  // Get villages for selected tambon
  const tambonVillages = CHIANG_KLANG_TAMBONS[tambon]?.villages || [];
  const tambonHospitals = CHIANG_KLANG_TAMBONS[tambon]?.hospitals || ALL_HEALTH_FACILITIES;

  const handleTambonChange = (newTambon: string) => {
    setTambon(newTambon);
    if (newTambon === 'ทั้งหมด') {
      setVillage('ทั้งหมด');
      setHospital('สสอ.เชียงกลาง');
    } else {
      const vList = CHIANG_KLANG_TAMBONS[newTambon]?.villages || [];
      if (vList.length > 0) setVillage(vList[0]);
      const hList = CHIANG_KLANG_TAMBONS[newTambon]?.hospitals || [];
      if (hList.length > 0) setHospital(hList[0]);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'ADMIN') {
      setTambon('ทั้งหมด');
      setVillage('ทั้งหมด');
      setHospital('สสอ.เชียงกลาง');
    } else if (newRole === 'HEALTH_OFFICER') {
      if (tambon === 'ทั้งหมด') {
        setTambon('เชียงกลาง');
        setVillage('ทั้งหมด');
        setHospital('รพ.สต.บ้านงิ้ว');
      }
    } else {
      if (tambon === 'ทั้งหมด') {
        setTambon('เชียงกลาง');
        const vList = CHIANG_KLANG_TAMBONS['เชียงกลาง']?.villages || [];
        setVillage(vList[0] || 'หมู่ 1');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้ (Username)');
      return;
    }

    if (username.trim().length < 2) {
      setError('ชื่อผู้ใช้ (Username) ต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
      return;
    }

    if (!/^[a-zA-Z0-9_\-\u0E00-\u0E7F]+$/.test(username.trim())) {
      setError('ชื่อผู้ใช้สามารถใช้ตัวอักษรภาษาไทย ภาษาอังกฤษ ตัวเลข ขีดล่าง หรือยัติภังค์ (ห้ามเว้นวรรค)');
      return;
    }

    // Check duplicate username with other users
    const isDuplicate = allUsers.some(
      (u) => u.id !== user.id && u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (isDuplicate) {
      setError(`ชื่อผู้ใช้ "${username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      return;
    }

    // Determine role label
    let roleLabel = 'อสม. ประจำหมู่บ้าน';
    if (role === 'ADMIN') {
      roleLabel = 'ผู้ดูแลระบบ (สสอ.เชียงกลาง)';
    } else if (role === 'HEALTH_OFFICER') {
      roleLabel = 'เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง)';
    }

    const updatedUser: User = {
      ...user,
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim() || user.password || 'password123',
      email: email.trim(),
      phone: phone.trim(),
      role,
      roleLabel,
      tambon,
      village: village || 'ทั้งหมด',
      hospital: hospital || 'รพ.เชียงกลาง',
    };

    onSave(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                แก้ไขข้อมูลผู้ใช้งาน
              </h2>
              <p className="text-xs text-slate-500">
                แก้ไขข้อมูลบัญชี: <span className="font-semibold text-slate-700">{user.fullName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection (Only Admin can change role) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              สิทธิ์การใช้งาน (Role)
            </label>
            {isAdmin ? (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('ADMIN')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    role === 'ADMIN'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>Admin</span>
                  <span className="text-[10px] font-normal text-slate-500">ผู้ดูแลระบบ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('HEALTH_OFFICER')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    role === 'HEALTH_OFFICER'
                      ? 'border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>เจ้าหน้าที่</span>
                  <span className="text-[10px] font-normal text-slate-500">รพ.สต. พี่เลี้ยง</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('VHV')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    role === 'VHV'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>อสม.</span>
                  <span className="text-[10px] font-normal text-slate-500">ประจำหมู่บ้าน</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                {user.roleLabel}
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่อ - นามสกุล <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="เช่น นายสมคิด สุขใจ"
              required
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="เช่น somsak หรือ แอดมินสสอ"
                  required
                />
                <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="กำหนดรหัสผ่านใหม่"
                />
                <Key className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อีเมล
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="example@gmail.com"
                />
                <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="08X-XXX-XXXX"
                />
                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Tambon & Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตำบลที่รับผิดชอบ
              </label>
              <select
                value={tambon}
                onChange={(e) => handleTambonChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              >
                {role === 'ADMIN' && <option value="ทั้งหมด">ทั้งหมด (ทั้งอำเภอ)</option>}
                {Object.keys(CHIANG_KLANG_TAMBONS).map((t) => (
                  <option key={t} value={t}>
                    ตำบล{t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมู่บ้าน
              </label>
              {tambon === 'ทั้งหมด' || role === 'ADMIN' ? (
                <input
                  type="text"
                  value={village || 'ทั้งหมด'}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  placeholder="ทั้งหมด"
                />
              ) : tambonVillages.length > 0 ? (
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                >
                  <option value="ทั้งหมด">ทุกหมู่บ้าน</option>
                  {tambonVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  placeholder="เช่น หมู่ 1 บ้าน..."
                />
              )}
            </div>
          </div>

          {/* Mentor Hospital */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รพ.สต. พี่เลี้ยง / หน่วยงานสังกัด
            </label>
            <div className="relative">
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              >
                {role === 'ADMIN' && <option value="สสอ.เชียงกลาง">สสอ.เชียงกลาง</option>}
                {ALL_HEALTH_FACILITIES.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
                {tambonHospitals.map((h) => (
                  !ALL_HEALTH_FACILITIES.includes(h as any) ? (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ) : null
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
