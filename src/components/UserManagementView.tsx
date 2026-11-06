import React, { useState } from 'react';
import { User } from '../types';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { exportMembersToExcel } from '../utils/excelExport';
import { isUserSomsak } from '../utils/storage';
import { UserDetailModal } from './UserDetailModal';
import { UserEditModal } from './UserEditModal';
import { UserDeleteModal } from './UserDeleteModal';
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
  Crown,
  Eye,
  Edit3,
  Trash2,
  Database,
  Filter
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: User;
  users: User[];
  onOpenRegister: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  onOpenRegister,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [tambonFilter, setTambonFilter] = useState<string>('ALL');

  // Modals state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  const isAdmin = currentUser.role === 'ADMIN';

  const cleanUsers = users.filter((u) => !isUserSomsak(u));

  // Counts by role
  const adminCount = cleanUsers.filter((u) => u.role === 'ADMIN').length;
  const officerCount = cleanUsers.filter((u) => u.role === 'HEALTH_OFFICER').length;
  const vhvCount = cleanUsers.filter((u) => u.role === 'VHV').length;
  const citizenCount = cleanUsers.filter((u) => u.role === 'CITIZEN').length;

  const filteredUsers = cleanUsers.filter((u) => {
    const matchSearch =
      !searchTerm ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.tambon && u.tambon.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.village && u.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.hospital && u.hospital.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchTambon =
      tambonFilter === 'ALL' ||
      u.tambon === tambonFilter ||
      u.tambon === 'ทั้งหมด';

    return matchSearch && matchRole && matchTambon;
  });

  const handleExportMembers = () => {
    exportMembersToExcel(filteredUsers, 'ทะเบียนสมาชิกและเจ้าหน้าที่_โรงพยาบาลเชียงกลาง');
  };

  const handleSaveUserEdit = (updatedUser: User) => {
    onUpdateUser(updatedUser);
    setSelectedUserForEdit(null);
    if (selectedUserForDetail && selectedUserForDetail.id === updatedUser.id) {
      setSelectedUserForDetail(updatedUser);
    }
  };

  const handleConfirmUserDelete = (userId: string) => {
    onDeleteUser(userId);
    setSelectedUserForDelete(null);
    if (selectedUserForDetail && selectedUserForDetail.id === userId) {
      setSelectedUserForDetail(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ข้อมูลและจัดการสมาชิกในระบบ
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              หน้าต่างข้อมูลและจัดการแก้ไขหรือลบข้อมูล: ผู้ดูแลระบบ (Admin), เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง) และ นสช.ประจำหมู่บ้าน
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-800 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-lg w-fit">
              <Database className="w-3.5 h-3.5 text-rose-600" />
              <span>ฐานข้อมูลระบบคลาวด์ • ซิงค์เรียลไทม์</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportMembers}
              className="px-3.5 py-2 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-rose-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-rose-600" />
              <span>ส่งออก Excel (.xlsx)</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ลงทะเบียนสมาชิกใหม่</span>
            </button>
          </div>
        </div>

        {/* 5 Role Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-slate-100">
          {/* Total Members */}
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-80">ทั้งหมด</span>
              <Users className="w-4 h-4 opacity-70" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {cleanUsers.length} <span className="text-xs font-normal opacity-80">คน</span>
            </div>
          </button>

          {/* Admin Count */}
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              roleFilter === 'ADMIN'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">ผู้ดูแลระบบ</span>
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {adminCount} <span className="text-xs font-normal opacity-80">คน</span>
            </div>
          </button>

          {/* Health Officer Count */}
          <button
            onClick={() => setRoleFilter('HEALTH_OFFICER')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              roleFilter === 'HEALTH_OFFICER'
                ? 'bg-rose-800 text-white border-rose-800 shadow-xs'
                : 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/70 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">จนท. รพ.สต.</span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {officerCount} <span className="text-xs font-normal opacity-80">คน</span>
            </div>
          </button>

          {/* VHV Count */}
          <button
            onClick={() => setRoleFilter('VHV')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              roleFilter === 'VHV'
                ? 'bg-pink-700 text-white border-pink-700 shadow-xs'
                : 'bg-pink-50/80 border-pink-200 hover:bg-pink-100/70 text-pink-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">นสช.</span>
              <UserCheck className="w-4 h-4 text-pink-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {vhvCount} <span className="text-xs font-normal opacity-80">คน</span>
            </div>
          </button>

          {/* Citizen Count */}
          <button
            onClick={() => setRoleFilter('CITIZEN')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              roleFilter === 'CITIZEN'
                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-purple-50/80 border-purple-200 hover:bg-purple-100/70 text-purple-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium opacity-90">บุคคลทั่วไป</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1">
              {citizenCount} <span className="text-xs font-normal opacity-80">คน</span>
            </div>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ-นามสกุล, ชื่อผู้ใช้, ตำบล, หมู่บ้าน, สังกัด รพ.สต...."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full sm:w-52 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 hover:border-rose-400 text-xs bg-white outline-none font-semibold text-slate-700 shadow-2xs"
            >
              <option value="ALL">แสดงทุกกลุ่มสมาชิก ({users.length})</option>
              <option value="ADMIN">👑 ผู้ดูแลระบบ (Admin) ({adminCount})</option>
              <option value="HEALTH_OFFICER">🩺 เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง) ({officerCount})</option>
              <option value="VHV">🤝 นสช. ประจำหมู่บ้าน ({vhvCount})</option>
            </select>
          </div>

          {/* Tambon Filter with Clear Colored Border */}
          <div className="w-full sm:w-48 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <select
              value={tambonFilter}
              onChange={(e) => setTambonFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-rose-500 hover:border-rose-600 focus:border-rose-700 text-xs outline-none font-bold text-rose-950 bg-rose-50/60 shadow-2xs"
            >
              <option value="ALL">📍 แสดงข้อมูลทุกตำบล</option>
              {Object.keys(CHIANG_KLANG_TAMBONS).map((t) => (
                <option key={t} value={t}>
                  📍 ข้อมูลตำบล{t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current User Quick Bar */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50/60 to-rose-50 rounded-2xl p-3.5 sm:p-4 border border-rose-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm truncate">{currentUser.fullName}</span>
              <span className="text-[10px] bg-rose-700 text-white px-2 py-0.5 rounded-full font-medium shrink-0">
                {currentUser.role === 'ADMIN' ? 'ผู้ดูแลระบบสูงสุด' : currentUser.roleLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              @{currentUser.username} • {currentUser.hospital}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedUserForDetail(currentUser)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>หน้าต่างข้อมูลของฉัน</span>
          </button>
          <button
            onClick={() => setSelectedUserForEdit(currentUser)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>แก้ไขโปรไฟล์</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-600">ไม่พบข้อมูลสมาชิกที่ตรงกับเงื่อนไขการค้นหา</p>
          <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองกลุ่มสมาชิกใหม่</p>
        </div>
      )}

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredUsers.map((u) => {
          const isCurrentUser = u.id === currentUser.id;
          const canManage = isAdmin || isCurrentUser;

          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl p-4 border transition shadow-xs space-y-3 flex flex-col justify-between ${
                isCurrentUser ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-100/70 hover:border-rose-300'
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'HEALTH_OFFICER'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {u.role === 'ADMIN' ? (
                        <Crown className="w-5 h-5 text-amber-600" />
                      ) : u.role === 'HEALTH_OFFICER' ? (
                        <ShieldCheck className="w-5 h-5 text-rose-700" />
                      ) : (
                        <UserCheck className="w-5 h-5 text-pink-700" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {u.fullName}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">
                        <span className="font-semibold text-slate-700">{u.roleLabel}</span> • <span className="font-mono text-slate-500">@{u.username}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {u.role === 'ADMIN' && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                        Admin
                      </span>
                    )}
                    {isCurrentUser && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
                        คุณ
                      </span>
                    )}
                  </div>
                </div>

                {/* Jurisdiction Info */}
                <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
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
                    <span className="text-slate-400">สังกัด:</span>
                    <span className="font-medium text-slate-800 truncate">{u.hospital}</span>
                  </div>
                </div>

                {/* Contact snippet */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                  <div className="flex items-center gap-1 truncate max-w-[140px]">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{u.email || '-'}</span>
                  </div>
                  {u.phone ? (
                    <a
                      href={`tel:${u.phone}`}
                      className="text-rose-700 font-medium hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{u.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">-</span>
                  )}
                </div>
              </div>

              {/* Action Buttons: ดูข้อมูล, แก้ไข, ลบ */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                {/* 1. ดูหน้าต่างข้อมูล */}
                <button
                  type="button"
                  onClick={() => setSelectedUserForDetail(u)}
                  className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-pink-50 hover:border-pink-300 hover:text-rose-800 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="เปิดหน้าต่างข้อมูลสมาชิก"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-600" />
                  <span>ดูข้อมูล</span>
                </button>

                {/* 2. แก้ไขข้อมูล */}
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(u)}
                  disabled={!canManage}
                  className={`px-2 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                    canManage
                      ? 'border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 text-slate-700'
                      : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                  title={canManage ? 'แก้ไขข้อมูล' : 'เฉพาะผู้ดูแลระบบหรือเจ้าของบัญชี'}
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>แก้ไข</span>
                </button>

                {/* 3. ลบข้อมูล */}
                <button
                  type="button"
                  onClick={() => setSelectedUserForDelete(u)}
                  disabled={!isAdmin}
                  className={`px-2 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                    isAdmin
                      ? 'border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-800 text-slate-700'
                      : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                  title={isAdmin ? 'ลบข้อมูล' : 'เฉพาะผู้ดูแลระบบเท่านั้นที่ลบได้'}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. User Detail Modal (หน้าต่างข้อมูล) */}
      <UserDetailModal
        user={selectedUserForDetail}
        isOpen={Boolean(selectedUserForDetail)}
        currentUser={currentUser}
        onClose={() => setSelectedUserForDetail(null)}
        onEdit={(targetUser) => {
          setSelectedUserForDetail(null);
          setSelectedUserForEdit(targetUser);
        }}
        onDelete={(targetUser) => {
          setSelectedUserForDetail(null);
          setSelectedUserForDelete(targetUser);
        }}
      />

      {/* 2. User Edit Modal (หน้าต่างแก้ไขข้อมูล) */}
      <UserEditModal
        user={selectedUserForEdit}
        isOpen={Boolean(selectedUserForEdit)}
        currentUser={currentUser}
        allUsers={users}
        onClose={() => setSelectedUserForEdit(null)}
        onSave={handleSaveUserEdit}
      />

      {/* 3. User Delete Confirm Modal (หน้าต่างยืนยันการลบ) */}
      <UserDeleteModal
        user={selectedUserForDelete}
        isOpen={Boolean(selectedUserForDelete)}
        currentUser={currentUser}
        allUsers={users}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirmDelete={handleConfirmUserDelete}
      />
    </div>
  );
};
