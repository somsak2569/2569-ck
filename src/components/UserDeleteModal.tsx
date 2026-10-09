import React from 'react';
import { User } from '../types';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  User as UserIcon, 
  Building2, 
  MapPin 
} from 'lucide-react';

interface UserDeleteModalProps {
  user: User | null;
  isOpen: boolean;
  currentUser: User;
  allUsers: User[];
  onClose: () => void;
  onConfirmDelete: (userId: string) => void;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  isOpen,
  currentUser,
  allUsers,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !user) return null;

  const isCurrentUser = user.id === currentUser.id;
  
  // Count remaining admins
  const adminCount = allUsers.filter((u) => u.role === 'ADMIN').length;
  const isLastAdmin = user.role === 'ADMIN' && adminCount <= 1;

  const canDelete = !isCurrentUser && !isLastAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-rose-950">
                ยืนยันการลบข้อมูลผู้ใช้งาน
              </h2>
              <p className="text-xs text-rose-700">
                ระบบจัดการสมาชิก สสอ.เชียงกลาง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Safeguard warnings */}
          {isCurrentUser && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">ไม่สามารถลบบัญชีนี้ได้</strong>
                <span>นี่คือบัญชีที่คุณกำลังใช้งานเข้าสู่ระบบอยู่ในขณะนี้ หากต้องการลบ กรุณาเข้าสู่ระบบด้วยบัญชี Admin อื่นก่อน</span>
              </div>
            </div>
          )}

          {isLastAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้</strong>
                <span>ระบบจำเป็นต้องมีผู้ดูแลระบบ (Admin) อย่างน้อย 1 ท่าน เพื่อควบคุมดูแลระบบ</span>
              </div>
            </div>
          )}

          {canDelete && (
            <p className="text-xs text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบัญชีของสมาชิกท่านนี้? การดำเนินการนี้จะลบข้อมูลออกจากทั้งอุปกรณ์และระบบคลาวด์ Firebase
            </p>
          )}

          {/* User Preview Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{user.fullName}</h4>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <span>@{user.username}</span>
                  <span>•</span>
                  <span className="font-sans text-teal-800 font-semibold">{user.roleLabel}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">สังกัด:</span>
                <span className="font-medium text-slate-800 truncate">{user.hospital}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">พื้นที่:</span>
                <span className="font-medium text-slate-800 truncate">
                  {user.tambon === 'ทั้งหมด' ? 'ทุกตำบลในอำเภอเชียงกลาง' : `ตำบล${user.tambon}`} {user.village && user.village !== 'ทั้งหมด' ? `(${user.village})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            ยกเลิก
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={() => {
                onConfirmDelete(user.id);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>ยืนยันการลบข้อมูล</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
