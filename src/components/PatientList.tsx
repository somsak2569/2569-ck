import React, { useState } from 'react';
import { PatientScreening, User, RiskLevel } from '../types';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { getRiskColorBadge } from '../utils/assessment';
import { exportPatientDataToExcel } from '../utils/excelExport';
import { canUserModifyPatient } from '../utils/storage';
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Eye, 
  Edit3, 
  Trash2, 
  PhoneCall, 
  UserPlus, 
  AlertTriangle, 
  ShieldAlert,
  ChevronRight,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

interface PatientListProps {
  currentUser: User;
  patients: PatientScreening[];
  onViewPatient: (patient: PatientScreening) => void;
  onEditPatient: (patient: PatientScreening) => void;
  onDeletePatient: (patientId: string) => void;
  onStartNewScreening: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  currentUser,
  patients,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
  onStartNewScreening,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [tambonFilter, setTambonFilter] = useState<string>('ALL');
  const [patientToDelete, setPatientToDelete] = useState<PatientScreening | null>(null);

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    // Search query
    const matchSearch =
      !searchTerm ||
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.idCard.includes(searchTerm) ||
      p.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.caregiverName && p.caregiverName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Risk Level filter
    let matchRisk = true;
    if (riskFilter !== 'ALL') {
      if (riskFilter === 'HIGH') matchRisk = p.eightQ?.riskLevel === 'HIGH';
      else if (riskFilter === 'MEDIUM') matchRisk = p.eightQ?.riskLevel === 'MEDIUM';
      else if (riskFilter === 'LOW') matchRisk = p.eightQ?.riskLevel === 'LOW';
      else if (riskFilter === 'NONE') matchRisk = !p.eightQ || p.eightQ.riskLevel === 'NONE';
    }

    // Tambon filter
    let matchTambon = true;
    if (tambonFilter !== 'ALL') {
      matchTambon = p.tambon === tambonFilter;
    }

    return matchSearch && matchRisk && matchTambon;
  });

  const handleExport = () => {
    exportPatientDataToExcel(filteredPatients, currentUser, 'ทะเบียนคนไข้คัดกรอง_เชียงกลาง');
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      onDeletePatient(patientToDelete.id);
      setPatientToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24">
      {/* Header bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ทะเบียนคนไข้ที่ได้รับการคัดกรอง
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {currentUser.role === 'ADMIN'
                ? 'แสดงข้อมูลทุกตำบลในอำเภอเชียงกลาง (สิทธิ์แอดมิน)'
                : `แสดงข้อมูลในเขตรับผิดชอบ: ตำบล${currentUser.tambon} (${currentUser.hospital})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>ดาวน์โหลด Excel ({filteredPatients.length})</span>
            </button>
            <button
              onClick={onStartNewScreening}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มคนไข้ใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อคนไข้, เลขบัตร, หมู่บ้าน, เบอร์โทร..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="ALL">ความเสี่ยงทั้งหมด</option>
              <option value="HIGH">🔴 เสี่ยงรุนแรง (8Q &gt;= 17)</option>
              <option value="MEDIUM">🟠 เสี่ยงปานกลาง (8Q 9-16)</option>
              <option value="LOW">🟡 เสี่ยงน้อย (8Q 1-8)</option>
              <option value="NONE">🟢 ปกติ / 0 คะแนน</option>
            </select>
          </div>

          {/* Tambon Filter (If Admin) */}
          {currentUser.role === 'ADMIN' && (
            <div>
              <select
                value={tambonFilter}
                onChange={(e) => setTambonFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-teal-500 hover:border-teal-600 focus:border-teal-700 text-xs focus:ring-2 focus:ring-teal-400 outline-none bg-teal-50/50 font-bold text-teal-900 shadow-2xs"
              >
                <option value="ALL">📍 แสดงข้อมูลทุกตำบล (6 ตำบล)</option>
                {Object.keys(CHIANG_KLANG_TAMBONS).map((t) => (
                  <option key={t} value={t}>
                    📍 ข้อมูลตำบล{t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Patient Cards / Table */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">ไม่พบข้อมูลคนไข้ที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มเพิ่มคนไข้ใหม่เพื่อเริ่มบันทึกแบบคัดกรอง
          </p>
          <button
            onClick={onStartNewScreening}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>บันทึกคัดกรองคนไข้ใหม่</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const riskLevel = patient.eightQ?.riskLevel || 'NONE';
            const riskBadge = getRiskColorBadge(riskLevel);
            const canModify = canUserModifyPatient(currentUser, patient);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-4 transition shadow-xs hover:shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => onViewPatient(patient)}
                        className="font-bold text-base text-slate-900 hover:text-teal-700 cursor-pointer transition flex items-center gap-1"
                      >
                        {patient.fullName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        ({patient.gender}, {patient.age} ปี)
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${riskBadge.badge}`}
                      >
                        {patient.eightQ ? `8Q: ${patient.eightQ.totalScore} คะแนน (${riskBadge.label})` : '2Q ปกติ'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {patient.villageName}, ต.{patient.tambon}
                      </span>
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`tel:${patient.phone}`}
                            className="text-teal-700 hover:underline"
                          >
                            {patient.phone}
                          </a>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        ประเมินเมื่อ {patient.screeningDate}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start">
                    <button
                      onClick={() => onViewPatient(patient)}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition flex items-center gap-1"
                      title="ดูรายละเอียดฉบับเต็ม"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">ดูข้อมูล</span>
                    </button>

                    {canModify && (
                      <>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition flex items-center gap-1"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">แก้ไข</span>
                        </button>

                        <button
                          onClick={() => setPatientToDelete(patient)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title="ลบข้อมูล"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Chronic Diseases and Caregiver snippet */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400">ปัจจัยเสี่ยง/โรค:</span>
                    {patient.chronicDiseases.length > 0 ? (
                      patient.chronicDiseases.slice(0, 3).map((d) => (
                        <span
                          key={d}
                          className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]"
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                    {patient.chronicDiseases.length > 3 && (
                      <span className="text-slate-400 text-[11px]">
                        +{patient.chronicDiseases.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <span>
                      ผู้ดูแล: <strong>{patient.caregiverName || '-'}</strong>
                    </span>
                    {patient.caregiverPhone && (
                      <a
                        href={`tel:${patient.caregiverPhone}`}
                        className="text-teal-700 font-medium hover:underline inline-flex items-center gap-0.5"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{patient.caregiverPhone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">ยืนยันการลบข้อมูล</h3>
                <p className="text-xs text-slate-500">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              ท่านต้องการลบข้อมูลแบบประเมินของคนไข้{' '}
              <strong className="text-slate-900">{patientToDelete.fullName}</strong> ({patientToDelete.villageName}, ต.{patientToDelete.tambon}) ออกจากระบบใช่หรือไม่?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
              >
                ยืนยันลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
