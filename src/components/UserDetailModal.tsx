import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Crown, 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Key, 
  Calendar, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  currentUser,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !user) return null;

  const isCurrentUser = user.id === currentUser.id;
  const isAdmin = currentUser.role === 'ADMIN';
  const canModify = isAdmin || isCurrentUser;

  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          iconBg: 'bg-amber-500 text-white',
          titleColor: 'text-amber-900',
          icon: <Crown className="w-5 h-5" />,
          label: 'ผู้ดูแลระบบ (Admin / สสอ.เชียงกลาง)',
        };
      case 'HEALTH_OFFICER':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
          iconBg: 'bg-teal-600 text-white',
          titleColor: 'text-teal-900',
          icon: <ShieldCheck className="w-5 h-5" />,
          label: 'เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง)',
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          iconBg: 'bg-emerald-600 text-white',
          titleColor: 'text-emerald-900',
          icon: <UserCheck className="w-5 h-5" />,
          label: 'อสม. ประจำหมู่บ้าน',
        };
    }
  };

  const theme = getRoleTheme(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Role Banner */}
        <div className={`p-5 sm:p-6 border-b ${theme.border} ${theme.bg} relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-md shrink-0`}>
              {theme.icon}
            </div>

            <div className="pr-6 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                  {theme.label}
                </span>
                {isCurrentUser && (
                  <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                    บัญชีของคุณในขณะนี้
                  </span>
                )}
              </div>
              <h2 className={`text-lg sm:text-xl font-bold ${theme.titleColor} mt-1.5 truncate`}>
                {user.fullName}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Account & Credentials Section */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>ข้อมูลบัญชีผู้ใช้งาน</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">ชื่อผู้ใช้ (Username)</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{user.username}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">รหัสผ่าน (Password)</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-700 transition"
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {showPassword ? (user.password || '••••••••') : '••••••••'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>ข้อมูลการติดต่อ</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>อีเมล:</span>
                </span>
                <span className="font-mono font-semibold text-slate-800 truncate max-w-[200px]">
                  {user.email || 'ไม่ได้ระบุ'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>เบอร์โทรศัพท์:</span>
                </span>
                {user.phone ? (
                  <a
                    href={`tel:${user.phone}`}
                    className="font-semibold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>{user.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">ไม่ได้ระบุ</span>
                )}
              </div>
            </div>
          </div>

          {/* Jurisdiction & Hospital Section */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>สังกัดและเขตพื้นที่รับผิดชอบ</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                <Building2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 text-[11px] block">รพ.สต. พี่เลี้ยง / หน่วยงานสังกัด</span>
                  <span className="font-bold text-slate-800">{user.hospital}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">ตำบลที่รับผิดชอบ</span>
                    <span className="font-semibold text-slate-800">
                      {user.tambon === 'ทั้งหมด' ? 'ทุกตำบล (ทั้งอำเภอ)' : `ตำบล${user.tambon}`}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">หมู่บ้าน</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {user.village || 'ทั้งหมด'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>สร้างเมื่อ: {user.createdAt || 'ระบบเริ่มต้น'}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>สถานะ: ใช้งานได้</span>
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2">
          {canModify ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(user)}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อมูล</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => onDelete(user)}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>ลบข้อมูล</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              เฉพาะผู้ดูแลระบบหรือเจ้าของบัญชีเท่านั้นที่แก้ไขได้
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition ml-auto cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
