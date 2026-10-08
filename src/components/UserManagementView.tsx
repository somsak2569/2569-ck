import React, { useState } from 'react';
import { User } from '../types';
import { exportMembersToExcel } from '../utils/excelExport';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  FileSpreadsheet, 
  Search, 
  MapPin, 
  Building2, 
  PhoneCall, 
  Mail, 
  UserPlus,
  Key
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: User;
  users: User[];
  onOpenRegister: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  onOpenRegister,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchTerm ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tambon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const handleExportMembers = () => {
    exportMembersToExcel(filteredUsers, 'ทะเบียนสมาชิกและเจ้าหน้าที่_สสอ_เชียงกลาง');
  };

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ข้อมูลสมาชิกและเจ้าหน้าที่ในระบบ
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isAdmin
                ? 'ผู้ดูแลระบบ (Admin) สามารถเข้าถึงข้อมูลสมาชิกได้ทั้งหมด ทุกตำบลใน อ.เชียงกลาง'
                : `ข้อมูลโปรไฟล์และสังกัดของท่าน (${currentUser.roleLabel})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportMembers}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ดาวน์โหลดรายชื่อสมาชิก Excel (.xlsx)</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่ม/ลงทะเบียนสมาชิก</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อสมาชิก, ตำบล, หมู่บ้าน, สังกัด รพ.สต...."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none font-medium text-slate-700"
            >
              <option value="ALL">ทุกสิทธิ์การใช้งาน</option>
              <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
              <option value="HEALTH_OFFICER">เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง)</option>
              <option value="VHV">อสม. ประจำหมู่บ้าน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current User Profile Card */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{currentUser.fullName}</h3>
                <span className="text-[11px] bg-teal-700 text-white px-2 py-0.5 rounded-full font-medium">
                  {currentUser.role === 'ADMIN' ? 'ผู้ดูแลระบบสูงสุด' : currentUser.roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Username: <span className="font-mono font-semibold">{currentUser.username}</span> • Email: {currentUser.email}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
            <div>
              <strong>เขตรับผิดชอบ:</strong> {currentUser.tambon === 'ทั้งหมด' ? 'ทุกตำบลในอำเภอเชียงกลาง' : `ตำบล${currentUser.tambon}`}
            </div>
            <div>
              <strong>รพ.สต. พี่เลี้ยง:</strong> {currentUser.hospital}
            </div>
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredUsers.map((u) => {
          const isCurrentUser = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl p-4 border transition shadow-xs space-y-3 ${
                isCurrentUser ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'HEALTH_OFFICER'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {u.role === 'ADMIN' ? (
                      <ShieldCheck className="w-5 h-5 text-amber-700" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-teal-700" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm truncate max-w-[170px]">
                      {u.fullName}
                    </h4>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {u.roleLabel}
                    </span>
                  </div>
                </div>

                {isCurrentUser && (
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                    บัญชีของคุณ
                  </span>
                )}
              </div>

              {/* Jurisdiction Details */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400">พื้นที่:</span>
                  <span className="font-medium text-slate-800 truncate">
                    {u.tambon === 'ทั้งหมด' ? 'ทุกตำบล (ทั้งอำเภอ)' : `ตำบล${u.tambon}`}
                  </span>
                </div>
                {u.village && u.village !== 'ทั้งหมด' && (
                  <div className="flex items-center gap-1.5 truncate pl-5">
                    <span className="text-slate-500 truncate">{u.village}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400">สังกัด/พี่เลี้ยง:</span>
                  <span className="font-medium text-slate-800 truncate">{u.hospital}</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[130px] font-mono text-[11px]">{u.email}</span>
                </div>
                {u.phone && (
                  <a
                    href={`tel:${u.phone}`}
                    className="text-teal-700 font-medium hover:underline flex items-center gap-0.5"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{u.phone}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
