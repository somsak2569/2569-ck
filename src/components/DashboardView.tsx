import React, { useState } from 'react';
import { PatientScreening, User, RiskLevel } from '../types';
import { CHIANG_KLANG_TAMBONS } from '../data/chiangklangData';
import { getRiskColorBadge } from '../utils/assessment';
import { exportPatientDataToExcel } from '../utils/excelExport';
import { 
  Users, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  PhoneCall, 
  PlusCircle, 
  Filter, 
  MapPin, 
  TrendingUp, 
  Activity, 
  Heart,
  ChevronRight,
  ShieldCheck,
  Building2,
  Eye
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  patients: PatientScreening[];
  onStartScreening: () => void;
  onViewPatient: (patient: PatientScreening) => void;
  onViewPatientList: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  patients,
  onStartScreening,
  onViewPatient,
  onViewPatientList,
}) => {
  const [selectedTambonFilter, setSelectedTambonFilter] = useState<string>('ทั้งหมด');

  // Filter patients based on user selection in dashboard
  const displayPatients = patients.filter((p) => {
    if (selectedTambonFilter === 'ทั้งหมด') return true;
    return p.tambon === selectedTambonFilter;
  });

  // Calculate metrics
  const totalCount = displayPatients.length;
  const highRiskPatients = displayPatients.filter((p) => p.eightQ?.riskLevel === 'HIGH');
  const mediumRiskPatients = displayPatients.filter((p) => p.eightQ?.riskLevel === 'MEDIUM');
  const lowRiskPatients = displayPatients.filter((p) => p.eightQ?.riskLevel === 'LOW');
  const noneRiskPatients = displayPatients.filter(
    (p) => !p.eightQ || p.eightQ.riskLevel === 'NONE'
  );

  const highRiskCount = highRiskPatients.length;
  const mediumRiskCount = mediumRiskPatients.length;
  const lowRiskCount = lowRiskPatients.length;
  const noneRiskCount = noneRiskPatients.length;

  // Chronic Disease distribution
  const diseaseFrequency: Record<string, number> = {};
  displayPatients.forEach((p) => {
    p.chronicDiseases.forEach((d) => {
      diseaseFrequency[d] = (diseaseFrequency[d] || 0) + 1;
    });
  });
  const topDiseases = Object.entries(diseaseFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Tambon statistics
  const tambonStats = Object.keys(CHIANG_KLANG_TAMBONS).map((tName) => {
    const list = patients.filter((p) => p.tambon === tName);
    const high = list.filter((p) => p.eightQ?.riskLevel === 'HIGH').length;
    return {
      name: tName,
      total: list.length,
      high,
    };
  });

  const handleExportExcel = () => {
    exportPatientDataToExcel(displayPatients, currentUser);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-24">
      {/* Welcome & Area Scope Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-teal-600/20 pointer-events-none"></div>
        <div className="absolute right-24 -top-10 w-40 h-40 rounded-full bg-teal-500/10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-teal-900/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs text-teal-200 border border-teal-700/60 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {currentUser.role === 'ADMIN'
                  ? 'อำเภอเชียงกลาง จังหวัดน่าน (สิทธิ์ผู้ดูแลระบบ)'
                  : `ตำบล${currentUser.tambon} (${currentUser.hospital})`}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              ระบบประเมินและคัดกรองความเสี่ยงการฆ่าตัวตาย
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              สำนักงานสาธารณสุขอำเภอเชียงกลาง • รพ.สต. และ อสม. ร่วมดูแลสุขภาพใจชุมชน ไม่ทอดทิ้งใครไว้ข้างหลัง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onStartScreening}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-teal-950" />
              <span>+ บันทึกคัดกรองคนไข้ใหม่</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition flex items-center gap-2 shadow-xs"
              title="ส่งออกรายงาน Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>ดาวน์โหลด Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Filter bar for Tambon (Admin & Health Officers can choose) */}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'HEALTH_OFFICER') && (
          <div className="mt-4 pt-3.5 border-t border-teal-600/70 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/80 border-2 border-teal-400 text-amber-300 font-bold shadow-xs shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>แสดงข้อมูลตำบล:</span>
            </div>

            {/* Button: ทั้งหมด (6 ตำบล) with clear distinct colored border */}
            <button
              onClick={() => setSelectedTambonFilter('ทั้งหมด')}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold border-2 cursor-pointer shadow-xs flex items-center gap-1 shrink-0 ${
                selectedTambonFilter === 'ทั้งหมด'
                  ? 'bg-white text-teal-950 border-amber-400 shadow-md ring-2 ring-amber-300/70 scale-[1.03]'
                  : 'bg-teal-950/70 text-teal-100 hover:text-white border-teal-400/90 hover:border-teal-200 hover:bg-teal-900'
              }`}
            >
              <span>ทั้งหมด (6 ตำบล)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                selectedTambonFilter === 'ทั้งหมด'
                  ? 'bg-teal-900 text-teal-100'
                  : 'bg-teal-800 text-teal-200'
              }`}>
                {patients.length}
              </span>
            </button>

            {/* Buttons for each of the 6 Tambons with clear distinct colored borders */}
            {Object.keys(CHIANG_KLANG_TAMBONS).map((t) => {
              const countInTambon = patients.filter((p) => p.tambon === t).length;
              const isSelected = selectedTambonFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTambonFilter(t)}
                  className={`px-3 py-1.5 rounded-xl transition-all font-bold border-2 cursor-pointer shadow-xs flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-white text-teal-950 border-amber-400 shadow-md ring-2 ring-amber-300/70 scale-[1.03]'
                      : 'bg-teal-950/70 text-teal-100 hover:text-white border-teal-400/90 hover:border-teal-200 hover:bg-teal-900'
                  }`}
                  title={`แสดงข้อมูลเฉพาะตำบล${t} (${countInTambon} คน)`}
                >
                  <span>ต.{t}</span>
                  {countInTambon > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      isSelected
                        ? 'bg-teal-900 text-teal-100'
                        : 'bg-teal-800/90 text-teal-200'
                    }`}>
                      {countInTambon}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* URGENT ALERT BANNER: If High-Risk Patients Present */}
      {highRiskCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0">
                <AlertOctagon className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-rose-900 text-sm sm:text-base">
                    แจ้งเตือนเฝ้าระวังด่วน: พบผู้มีความเสี่ยงฆ่าตัวตายระดับรุนแรง {highRiskCount} ราย!
                  </h3>
                  <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    8Q &gt;= 17
                  </span>
                </div>
                <p className="text-xs text-rose-700 mt-0.5">
                  โปรดติดตามห้ามปล่อยให้อยู่ตามลำพัง และประสาน รพ.เชียงกลาง หรือสายด่วน 1323 ทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={onViewPatientList}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>ดูรายชื่อเคสฉุกเฉิน</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="tel:054791111"
                className="px-3.5 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100/50 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                <span>รพ.เชียงกลาง</span>
              </a>
            </div>
          </div>

          {/* Quick list preview of High Risk Patients */}
          <div className="mt-3.5 pt-3 border-t border-rose-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {highRiskPatients.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onViewPatient(p)}
                className="bg-white p-2.5 rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer transition flex items-center justify-between text-xs"
              >
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-800 truncate">{p.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {p.villageName} • 8Q: {p.eightQ?.totalScore} คะแนน
                  </div>
                </div>
                <Eye className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Screened */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">คัดกรองทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {totalCount}
            </div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">
              คนในระบบ
            </div>
          </div>
        </div>

        {/* High Risk (Red) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-xs flex flex-col justify-between hover:border-rose-300 transition bg-gradient-to-b from-rose-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">เสี่ยงรุนแรง</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              8Q &gt;= 17
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              {highRiskCount}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">
              {totalCount > 0 ? ((highRiskCount / totalCount) * 100).toFixed(1) : 0}% ของทั้งหมด
            </div>
          </div>
        </div>

        {/* Medium Risk (Orange) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition bg-gradient-to-b from-amber-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">เสี่ยงปานกลาง</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              8Q 9-16
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {mediumRiskCount}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">
              {totalCount > 0 ? ((mediumRiskCount / totalCount) * 100).toFixed(1) : 0}% ของทั้งหมด
            </div>
          </div>
        </div>

        {/* Low Risk (Yellow) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-yellow-200 shadow-xs flex flex-col justify-between hover:border-yellow-300 transition bg-gradient-to-b from-yellow-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-yellow-800">เสี่ยงน้อย</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-xs">
              8Q 1-8
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-yellow-700">
              {lowRiskCount}
            </div>
            <div className="text-[11px] text-yellow-600 font-medium mt-0.5">
              {totalCount > 0 ? ((lowRiskCount / totalCount) * 100).toFixed(1) : 0}% ของทั้งหมด
            </div>
          </div>
        </div>

        {/* None / Normal (Green) */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">ปกติ / ไม่มีความเสี่ยง</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {noneRiskCount}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {totalCount > 0 ? ((noneRiskCount / totalCount) * 100).toFixed(1) : 0}% ของทั้งหมด
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Suicide Risk Distribution Bar & Progress */}
        {/* Chart 1: Suicide Risk Distribution Pie Chart (กราฟวงกลม) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                สัดส่วนระดับความเสี่ยงการฆ่าตัวตาย (8Q)
              </h3>
              <p className="text-xs text-slate-500">
                แผนภูมิกราฟวงกลมแปลผลตามเกณฑ์คะแนนมาตรฐานกรมสุขภาพจิต
              </p>
            </div>
          </div>

          {/* Pie Chart Representation */}
          {(() => {
            const slices = [
              {
                id: 'HIGH',
                label: 'รุนแรง (>= 17)',
                count: highRiskCount,
                color: '#e11d48', // rose-600
                hoverBg: 'bg-rose-50 border-rose-300 text-rose-900',
                badgeBg: 'bg-rose-600',
                borderCol: 'border-rose-200',
              },
              {
                id: 'MEDIUM',
                label: 'ปานกลาง (9-16)',
                count: mediumRiskCount,
                color: '#f59e0b', // amber-500
                hoverBg: 'bg-amber-50 border-amber-300 text-amber-900',
                badgeBg: 'bg-amber-500',
                borderCol: 'border-amber-200',
              },
              {
                id: 'LOW',
                label: 'น้อย (1-8)',
                count: lowRiskCount,
                color: '#eab308', // yellow-500
                hoverBg: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                badgeBg: 'bg-yellow-400',
                borderCol: 'border-yellow-200',
              },
              {
                id: 'NONE',
                label: 'ปกติ / 0 คะแนน',
                count: noneRiskCount,
                color: '#10b981', // emerald-500
                hoverBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
                badgeBg: 'bg-emerald-500',
                borderCol: 'border-emerald-200',
              },
            ];

            const activeSlices = slices.filter((s) => s.count > 0);

            // Calculate SVG Donut / Pie path arcs
            let cumulativePercent = 0;
            const size = 180;
            const center = size / 2;
            const radius = 70;
            const innerRadius = 42; // Donut hole for modern legible look

            const getCoordinatesForPercent = (percent: number, r: number) => {
              const x = center + r * Math.cos(2 * Math.PI * percent - Math.PI / 2);
              const y = center + r * Math.sin(2 * Math.PI * percent - Math.PI / 2);
              return [x, y];
            };

            const paths = activeSlices.map((slice) => {
              const fraction = totalCount > 0 ? slice.count / totalCount : 0;
              const startPercent = cumulativePercent;
              const endPercent = cumulativePercent + fraction;
              cumulativePercent = endPercent;

              // Full circle special case
              if (fraction >= 0.999) {
                return {
                  ...slice,
                  fraction,
                  pathData: '',
                  isFullCircle: true,
                };
              }

              const [startX, startY] = getCoordinatesForPercent(startPercent, radius);
              const [endX, endY] = getCoordinatesForPercent(endPercent, radius);
              const [innerStartX, innerStartY] = getCoordinatesForPercent(startPercent, innerRadius);
              const [innerEndX, innerEndY] = getCoordinatesForPercent(endPercent, innerRadius);

              const largeArcFlag = fraction > 0.5 ? 1 : 0;

              const pathData = [
                `M ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L ${innerEndX} ${innerEndY}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
                'Z',
              ].join(' ');

              return {
                ...slice,
                fraction,
                pathData,
                isFullCircle: false,
              };
            });

            return (
              <div className="space-y-4">
                {totalCount === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
                    <Activity className="w-8 h-8 text-slate-300" />
                    <span>ยังไม่มีข้อมูลผู้รับการคัดกรองในพื้นที่นี้</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-1">
                    {/* SVG Pie Chart Graphic */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        className="transform -rotate-90 drop-shadow-xs transition-transform duration-500"
                      >
                        {paths.map((p) => {
                          if (p.isFullCircle) {
                            return (
                              <g key={p.id}>
                                <circle
                                  cx={center}
                                  cy={center}
                                  r={(radius + innerRadius) / 2}
                                  fill="none"
                                  stroke={p.color}
                                  strokeWidth={radius - innerRadius}
                                  className="transition-all duration-300 hover:opacity-90"
                                >
                                  <title>{`${p.label}: ${p.count} คน (100%)`}</title>
                                </circle>
                              </g>
                            );
                          }
                          return (
                            <path
                              key={p.id}
                              d={p.pathData}
                              fill={p.color}
                              stroke="#ffffff"
                              strokeWidth="2.5"
                              className="transition-all duration-200 hover:opacity-85 cursor-pointer hover:scale-[1.02] origin-center"
                            >
                              <title>{`${p.label}: ${p.count} คน (${(p.fraction * 100).toFixed(1)}%)`}</title>
                            </path>
                          );
                        })}
                      </svg>

                      {/* Center Info in the Pie/Donut hole */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl sm:text-2xl font-black text-slate-800 leading-none">
                          {totalCount}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          คนทั้งหมด
                        </span>
                      </div>
                    </div>

                    {/* Quick percentage breakdown next to Pie Chart */}
                    <div className="flex-1 w-full space-y-1.5">
                      {slices.map((slice) => {
                        const percent = totalCount > 0 ? (slice.count / totalCount) * 100 : 0;
                        return (
                          <div
                            key={slice.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition ${
                              slice.count > 0 ? slice.borderCol + ' bg-slate-50/70' : 'border-slate-100 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: slice.color }}
                              ></span>
                              <span className="font-medium text-slate-700 truncate">
                                {slice.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-slate-800">
                                {slice.count} คน
                              </span>
                              <span
                                className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md min-w-[42px] text-right"
                                style={{
                                  backgroundColor: slice.count > 0 ? `${slice.color}20` : '#f1f5f9',
                                  color: slice.color,
                                }}
                              >
                                {percent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-legend badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-center">
                    <div className="font-semibold text-rose-700">🔴 รุนแรง</div>
                    <div className="font-extrabold text-sm text-rose-800 mt-0.5">
                      {highRiskCount} คน
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
                    <div className="font-semibold text-amber-700">🟠 ปานกลาง</div>
                    <div className="font-extrabold text-sm text-amber-800 mt-0.5">
                      {mediumRiskCount} คน
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-900 text-center">
                    <div className="font-semibold text-yellow-800">🟡 น้อย</div>
                    <div className="font-extrabold text-sm text-yellow-800 mt-0.5">
                      {lowRiskCount} คน
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                    <div className="font-semibold text-emerald-700">🟢 ปกติ</div>
                    <div className="font-extrabold text-sm text-emerald-800 mt-0.5">
                      {noneRiskCount} คน
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Chart 2: Top Chronic Diseases & Risk Factors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-teal-600" />
                โรคประจำตัวและปัจจัยเสี่ยงที่พบบ่อย
              </h3>
              <p className="text-xs text-slate-500">
                กลุ่มอาการและปัญหาที่พบร่วมกับความเสี่ยงการฆ่าตัวตาย
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topDiseases.length > 0 ? (
              topDiseases.map(([disease, count]) => {
                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                return (
                  <div key={disease} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span className="font-medium truncate">{disease}</span>
                      <span className="font-bold text-teal-800">
                        {count} คน ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, percentage * 1.2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                ยังไม่มีข้อมูลโรคประจำตัวที่ระบุ
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Chiang Klang 6 Tambons Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                สถิติการคัดกรองแยกตาม 6 ตำบล ในอำเภอเชียงกลาง
              </h3>
              <p className="text-xs text-slate-500">
                โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) ทุกแห่งทำหน้าที่เป็นพี่เลี้ยงร่วมกับ อสม.
              </p>
            </div>

            <button
              onClick={handleExportExcel}
              className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ส่งออกตารางสรุปเป็น Excel</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {tambonStats.map((item) => {
              const isSelected = selectedTambonFilter === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setSelectedTambonFilter(isSelected ? 'ทั้งหมด' : item.name)}
                  className={`p-3 rounded-2xl border-2 transition text-center cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 shadow-md ring-2 ring-teal-400/60 scale-[1.03]'
                      : 'bg-white hover:bg-teal-50/60 border-teal-500/80 hover:border-teal-600'
                  }`}
                  title={`คลิกเพื่อกรองข้อมูลเฉพาะ ต.${item.name}`}
                >
                  <div className="text-xs font-bold text-slate-800 truncate">
                    ต.{item.name}
                  </div>
                  <div className="text-xl font-extrabold text-teal-850 mt-1">
                    {item.total}
                  </div>
                  <div className="text-[10px] text-slate-500">ผู้รับการประเมิน</div>

                  {item.high > 0 ? (
                    <div className="mt-2 text-[10px] font-bold text-rose-700 bg-rose-100 py-0.5 px-2 rounded-full inline-block border border-rose-300">
                      เสี่ยงรุนแรง {item.high}
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-full inline-block border border-emerald-300">
                      ปลอดภัย
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
