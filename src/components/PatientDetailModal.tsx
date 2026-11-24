import React, { useState, useMemo, useEffect } from 'react';
import { PatientScreening, User, AssessmentRound } from '../types';
import {
  getRiskColorBadge,
  EIGHT_Q_QUESTIONS,
  getStressLevelDetails,
  getOASRiskBadge,
  getPatientAssessmentRounds,
} from '../utils/assessment';
import { canUserModifyPatient } from '../utils/storage';
import { IndividualComparisonCharts } from './AssessmentComparisonCharts';
import {
  X,
  PhoneCall,
  ShieldAlert,
  Printer,
  Calendar,
  BarChart3,
  History,
  FileText,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: PatientScreening;
  currentUser: User;
  initialTab?: 'DETAIL' | 'COMPARE' | 'HISTORY';
  onClose: () => void;
  onEdit: (patient: PatientScreening) => void;
  onAddNewRound?: (patient: PatientScreening) => void;
  onEditRound?: (patient: PatientScreening, roundId: string) => void;
  onDeleteRound?: (patient: PatientScreening, roundId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  currentUser,
  initialTab = 'DETAIL',
  onClose,
  onEdit,
  onAddNewRound,
  onEditRound,
  onDeleteRound,
}) => {
  const rounds = useMemo(() => getPatientAssessmentRounds(patient), [patient]);
  const latestRound = rounds[rounds.length - 1];

  const [activeTab, setActiveTab] = useState<'DETAIL' | 'COMPARE' | 'HISTORY'>(initialTab);
  const [selectedRoundId, setSelectedRoundId] = useState<string>(latestRound?.roundId || '');
  const [confirmDeleteRoundId, setConfirmDeleteRoundId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, patient.id]);

  useEffect(() => {
    if (!rounds.some((r) => r.roundId === selectedRoundId)) {
      setSelectedRoundId(rounds[rounds.length - 1]?.roundId || '');
    }
  }, [rounds, selectedRoundId]);

  const currentRound: AssessmentRound = useMemo(() => {
    return rounds.find((r) => r.roundId === selectedRoundId) || latestRound;
  }, [rounds, selectedRoundId, latestRound]);

  const canModify = canUserModifyPatient(currentUser, patient);
  const riskBadge = getRiskColorBadge(currentRound?.eightQ?.riskLevel || 'NONE');
  const activeScreeningGroup = currentRound?.screeningGroup ?? patient.screeningGroup;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#BE185D] text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-rose-950/60 text-pink-200 px-2 py-0.5 rounded font-mono border border-pink-300/30">
                HN/ID: {patient.id}
              </span>
              <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold border border-white/30">
                ประเมินแล้ว {rounds.length} ครั้ง
              </span>
              {activeScreeningGroup && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    activeScreeningGroup === 'DEPRESSION_SUICIDE'
                      ? 'bg-pink-100 text-rose-900 border-pink-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {activeScreeningGroup === 'DEPRESSION_SUICIDE'
                    ? 'เครียดซึมเศร้า อยากตาย'
                    : 'กลุ่มเสี่ยงก่อความรุนแรง'}
                </span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${riskBadge.badge}`}>
                {currentRound?.eightQ
                  ? `8Q (ครั้งที่ ${currentRound.roundNumber}): ${currentRound.eightQ.totalScore} คะแนน (${riskBadge.label})`
                  : `2Q ปกติ (ครั้งที่ ${currentRound?.roundNumber || 1})`}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {patient.fullName}
            </h2>
            <p className="text-xs text-pink-100/90">
              เพศ {patient.gender} • อายุ {patient.age} ปี • {patient.villageName}, ตำบล{patient.tambon}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 text-pink-200 hover:text-white rounded-lg transition cursor-pointer"
              title="พิมพ์เอกสาร"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-pink-200 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-rose-50/70 border-b border-rose-200 px-3 sm:px-6 pt-2.5 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('DETAIL')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'DETAIL'
                ? 'bg-white text-rose-800 border-rose-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-rose-700 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>รายละเอียดการประเมิน</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPARE')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'COMPARE'
                ? 'bg-white text-rose-800 border-rose-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-rose-700 hover:bg-white/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>กราฟเปรียบเทียบรายบุคคล ({rounds.length} ครั้ง)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'HISTORY'
                ? 'bg-white text-rose-800 border-rose-600 shadow-2xs'
                : 'text-slate-600 border-transparent hover:text-rose-700 hover:bg-white/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติการประเมิน ({rounds.length} ครั้ง)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm flex-1">
          {activeTab === 'COMPARE' && (
            <IndividualComparisonCharts
              patient={patient}
              canModify={canModify}
              onSelectRoundToView={(round) => {
                setSelectedRoundId(round.roundId);
                setActiveTab('DETAIL');
              }}
              onEditRound={(round) => {
                if (onEditRound) {
                  onEditRound(patient, round.roundId);
                } else {
                  onEdit(patient);
                }
              }}
            />
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    ไทม์ไลน์ประวัติการประเมินทั้งหมด ({rounds.length} ครั้ง)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    เรียงลำดับจากครั้งที่ 1 จนถึงครั้งล่าสุด สามารถดู แก้ไข หรือจัดการเฉพาะรอบได้
                  </p>
                </div>
                {canModify && onAddNewRound && (
                  <button
                    type="button"
                    onClick={() => onAddNewRound(patient)}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>บันทึกประเมินครั้งที่ {rounds.length + 1}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {[...rounds].reverse().map((r) => {
                  const rBadge = getRiskColorBadge(r.eightQ?.riskLevel || 'NONE');
                  const rStress = getStressLevelDetails(r.stressAssessment?.level || 'NONE');
                  const rOasBadge = r.oasAssessment ? getOASRiskBadge(r.oasAssessment.riskLevel) : null;
                  const isLatest = r.roundId === latestRound.roundId;

                  return (
                    <div
                      key={r.roundId}
                      className={`p-4 rounded-2xl border transition space-y-3 ${
                        isLatest
                          ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="bg-rose-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              ครั้งที่ {r.roundNumber} {isLatest ? '(ล่าสุด)' : ''}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {r.screeningDate}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rBadge.badge}`}>
                              8Q: {r.eightQ ? `${r.eightQ.totalScore} คะแนน (${rBadge.label})` : '0 (2Q ปกติ)'}
                            </span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${rStress.badgeClass}`}>
                              {rStress.emoji} {rStress.label}
                            </span>
                            {r.oasAssessment && rOasBadge && (
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${rOasBadge.bg}`}>
                                OAS: {r.oasAssessment.totalScore}/16 ({rOasBadge.label})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ผู้ประเมิน: <strong className="text-slate-700">{r.surveyorName || '-'}</strong> ({r.surveyorRole || '-'}) • สถานะ: <span className="text-rose-800 font-semibold">{r.followUpStatus}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoundId(r.roundId);
                              setActiveTab('DETAIL');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูรายละเอียด</span>
                          </button>

                          {canModify && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onEditRound) {
                                  onEditRound(patient, r.roundId);
                                } else {
                                  onEdit(patient);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>แก้ไขรอบนี้</span>
                            </button>
                          )}

                          {canModify && onDeleteRound && rounds.length > 1 && (
                            confirmDeleteRoundId === r.roundId ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 rounded-lg px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteRound(patient, r.roundId);
                                    setConfirmDeleteRoundId(null);
                                  }}
                                  className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                                >
                                  ยืนยันลบ
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteRoundId(null)}
                                  className="text-[11px] font-medium text-slate-600 hover:underline cursor-pointer"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRoundId(r.roundId)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                                title="ลบผลการประเมินรอบนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {r.notes && (
                        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                          <strong>บันทึก/หมายเหตุ:</strong> {r.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'DETAIL' && (
            <>
              {/* Round Selector Strip when > 1 round */}
              {rounds.length > 1 && (
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-rose-900">
                    เลือกดูข้อมูลรายครั้ง (กำลังแสดง: ครั้งที่ {currentRound.roundNumber} วันที่ {currentRound.screeningDate})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rounds.map((r) => {
                      const active = r.roundId === currentRound.roundId;
                      const isLast = r.roundId === latestRound.roundId;
                      return (
                        <button
                          key={r.roundId}
                          type="button"
                          onClick={() => setSelectedRoundId(r.roundId)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                            active
                              ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                          }`}
                        >
                          ครั้งที่ {r.roundNumber}
                          {isLast ? ' (ล่าสุด)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* High risk emergency warning */}
              {currentRound?.eightQ?.riskLevel === 'HIGH' && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900">
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-rose-800 text-sm">
                      ผู้ป่วยมีความเสี่ยงฆ่าตัวตายระดับรุนแรง (8Q = {currentRound.eightQ.totalScore} คะแนน • ครั้งที่ {currentRound.roundNumber})
                    </div>
                    <div className="text-xs text-rose-700 leading-relaxed">
                      ต้องเฝ้าระวังไม่ให้อยู่ตามลำพังเด็ดขาด เก็บสิ่งของอันตราย และประสานส่งต่อจิตแพทย์ รพ.เชียงกลาง ทันที
                    </div>
                    <div className="pt-1 flex flex-wrap gap-2">
                      <a
                        href="tel:0979184142"
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>สายด่วน ศูนย์พึ่งพาได้ รพ.เชียงกลาง (หมออรทัย) 0979184142</span>
                      </a>
                      <a
                        href="tel:054791111"
                        className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>โทรด่วน รพ.เชียงกลาง (054-791111)</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Patient Demographics */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  ข้อมูลทั่วไปและที่อยู่
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="sm:col-span-2 pb-1">
                    <span className="text-slate-400">กลุ่มเป้าหมายการคัดกรอง (ส่วนที่ 1): </span>
                    {activeScreeningGroup ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs border ${
                          activeScreeningGroup === 'DEPRESSION_SUICIDE'
                            ? 'bg-pink-100 text-rose-900 border-pink-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {activeScreeningGroup === 'DEPRESSION_SUICIDE'
                          ? '☑ เครียดซึมเศร้า อยากตาย'
                          : '☑ กลุ่มเสี่ยงก่อความรุนแรง'}
                      </span>
                    ) : (
                      <span className="text-slate-500">ไม่ได้ระบุ</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400">เลขประจำตัวประชาชน: </span>
                    <span className="font-medium text-slate-800">{patient.idCard || 'ไม่ได้ระบุ (ถ้ามี / ไม่บังคับ)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">เบอร์โทรศัพท์: </span>
                    {patient.phone ? (
                      <a href={`tel:${patient.phone}`} className="font-medium text-rose-700 underline">
                        {patient.phone}
                      </a>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400">ที่อยู่: </span>
                    <span className="font-medium text-slate-800">
                      บ้านเลขที่ {patient.addressNo || '-'} {patient.villageName} ต.{patient.tambon} อ.เชียงกลาง จ.น่าน
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">รพ.สต. พี่เลี้ยง: </span>
                    <span className="font-medium text-rose-900">{patient.mentorHospital}</span>
                  </div>
                </div>

                {/* Chronic Diseases */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold text-xs block mb-1">
                    โรคประจำตัว / ปัจจัยเสี่ยง:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.chronicDiseases.map((d) => (
                      <span
                        key={d}
                        className="bg-pink-100 text-rose-950 font-medium px-2.5 py-0.5 rounded-full text-xs"
                      >
                        {d}
                      </span>
                    ))}
                    {patient.otherChronicDisease && (
                      <span className="bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full text-xs">
                        อื่นๆ: {patient.otherChronicDisease}
                      </span>
                    )}
                    {patient.chronicDiseases.length === 0 && !patient.otherChronicDisease && (
                      <span className="text-slate-400 text-xs">- ไม่มี -</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Caregiver Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  ข้อมูลผู้ดูแล (Caregiver)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">ชื่อผู้ดูแล: </span>
                    <span className="font-bold text-slate-800">{patient.caregiverName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ความสัมพันธ์: </span>
                    <span className="font-medium text-slate-800">{patient.caregiverRelation || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">เบอร์โทรศัพท์: </span>
                    {patient.caregiverPhone ? (
                      <a
                        href={`tel:${patient.caregiverPhone}`}
                        className="font-bold text-rose-700 inline-flex items-center gap-1 hover:underline"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{patient.caregiverPhone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Stress Level Assessment (ระดับความเครียด กรมสุขภาพจิต 5 ระดับ) */}
              {(() => {
                const stress = getStressLevelDetails(currentRound?.stressAssessment?.level || 'NONE');
                return (
                  <div className={`p-4 rounded-2xl border space-y-2 ${stress.bgClass} ${stress.borderClass}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{stress.emoji}</span>
                        <div>
                          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                            ระดับความเครียด (กรมสุขภาพจิต) • ครั้งที่ {currentRound.roundNumber}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Mental Health Check-in (ระดับ {stress.score}/5)
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${stress.badgeClass}`}>
                        {stress.emoji} {stress.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 pt-1 leading-relaxed border-t border-slate-200/60">
                      {stress.description}
                    </p>
                  </div>
                );
              })()}

              {/* Section: 2Q Plus Answers Breakdown */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    ผลการคัดกรอง 2Q Plus (ครั้งที่ {currentRound.roundNumber})
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      currentRound.twoQ.hasDepressionRisk
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentRound.twoQ.hasDepressionRisk ? 'พบความเสี่ยงซึมเศร้า' : 'ปกติ'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                    <span>1. รู้สึกหดหู่ เศร้า ท้อแท้สิ้นหวัง</span>
                    <span className={currentRound.twoQ.q1Depressed ? 'font-bold text-rose-600' : 'text-slate-600'}>
                      {currentRound.twoQ.q1Depressed ? 'มี' : 'ไม่มี'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                    <span>2. รู้สึกเบื่อ ไม่เพลิดเพลิน</span>
                    <span className={currentRound.twoQ.q2Anhedonia ? 'font-bold text-rose-600' : 'text-slate-600'}>
                      {currentRound.twoQ.q2Anhedonia ? 'มี' : 'ไม่มี'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                    <span className="font-medium text-amber-900">Plus: ความคิดอยากทำร้ายตนเองหรือตายไปจะดีกว่า</span>
                    <span className={currentRound.twoQ.qPlusSelfHarm ? 'font-bold text-rose-600' : 'text-slate-600'}>
                      {currentRound.twoQ.qPlusSelfHarm ? 'มี' : 'ไม่มี'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: แบบประเมินพฤติกรรมก้าวร้าวรุนแรง (Overt Aggression Scale: OAS) */}
              {currentRound.oasAssessment ? (
                (() => {
                  const oas = currentRound.oasAssessment;
                  const oasBadge = getOASRiskBadge(oas.riskLevel);
                  return (
                    <div className={`p-4 rounded-2xl border space-y-3 ${oasBadge.bg}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className={`w-5 h-5 ${oasBadge.text}`} />
                          <div>
                            <h3 className="font-bold text-xs uppercase tracking-wider">
                              แบบประเมินพฤติกรรมก้าวร้าวรุนแรง (OAS) • ครั้งที่ {currentRound.roundNumber}
                            </h3>
                            <p className="text-[11px] opacity-80">
                              {oas.assessedByName
                                ? `ผู้ประเมิน: ${oas.assessedByName} (${oas.assessedByRole || 'จนท. รพ.สต.'})`
                                : 'ประเมินโดยเจ้าหน้าที่ รพ.สต./พี่เลี้ยง'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-white/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                            รวม {oas.totalScore}/16 คะแนน
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${oasBadge.badge}`}>
                            {oasBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* 4 Categories Score Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/90 border border-black/5 space-y-0.5">
                          <div className="text-[11px] text-slate-500 font-medium">1. ทางวาจา</div>
                          <div className="text-sm font-extrabold text-slate-800">
                            {oas.verbalScore} <span className="text-[10px] font-normal text-slate-500">/ 4</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/90 border border-black/5 space-y-0.5">
                          <div className="text-[11px] text-slate-500 font-medium">2. ต่อสิ่งของ/ทรัพย์สิน</div>
                          <div className="text-sm font-extrabold text-slate-800">
                            {oas.propertyScore} <span className="text-[10px] font-normal text-slate-500">/ 4</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/90 border border-black/5 space-y-0.5">
                          <div className="text-[11px] text-slate-500 font-medium">3. ต่อตนเอง</div>
                          <div className="text-sm font-extrabold text-slate-800">
                            {oas.selfScore} <span className="text-[10px] font-normal text-slate-500">/ 4</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/90 border border-black/5 space-y-0.5">
                          <div className="text-[11px] text-slate-500 font-medium">4. ต่อผู้อื่น</div>
                          <div className="text-sm font-extrabold text-slate-800">
                            {oas.otherScore} <span className="text-[10px] font-normal text-slate-500">/ 4</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <p className="text-xs pt-1 leading-relaxed opacity-95">
                        {oasBadge.recommendation}
                      </p>

                      {oas.notes && (
                        <div className="text-xs bg-white/80 p-2.5 rounded-xl border border-black/10 text-slate-800">
                          <strong>บันทึกเพิ่มเติมจากเจ้าหน้าที่:</strong> {oas.notes}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-3.5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 text-xs text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span>ยังไม่มีข้อมูลการประเมิน OAS ในครั้งที่ {currentRound.roundNumber}</span>
                  </span>
                  {(currentUser.role === 'HEALTH_OFFICER' || currentUser.role === 'ADMIN') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onEditRound) {
                          onEditRound(patient, currentRound.roundId);
                        } else {
                          onEdit(patient);
                        }
                      }}
                      className="text-rose-700 font-bold hover:underline cursor-pointer"
                    >
                      + บันทึกประเมิน OAS
                    </button>
                  )}
                </div>
              )}

              {/* Section: 8Q Answers Breakdown (If executed) */}
              {currentRound.eightQ && (
                <div className="p-4 rounded-2xl border border-rose-200 bg-white space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-rose-100">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        แบบประเมินการฆ่าตัวตาย (8Q) กรมสุขภาพจิต • ครั้งที่ {currentRound.roundNumber}
                      </h3>
                      <div className="text-xs text-rose-700 font-bold">
                        คะแนนรวม: {currentRound.eightQ.totalScore} คะแนน • {currentRound.eightQ.riskLabel}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {EIGHT_Q_QUESTIONS.map((q) => {
                      const score = currentRound.eightQ![q.id as keyof typeof currentRound.eightQ] as number;
                      const isYes = score > 0;
                      return (
                        <div
                          key={q.id}
                          className={`flex justify-between items-center p-2 rounded-lg ${
                            isYes ? 'bg-rose-50 text-rose-950 font-medium' : 'bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="pr-2">
                            {q.number}. {q.question}
                          </span>
                          <span
                            className={`shrink-0 font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isYes ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isYes ? `มี (${score} คะแนน)` : 'ไม่มี (0)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Survey & Administrative Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider">
                  ข้อมูลการติดตามและผู้ประเมิน (ครั้งที่ {currentRound.roundNumber})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400">สถานะการดูแล: </span>
                    <span className="font-bold text-rose-900">{currentRound.followUpStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">วันที่คัดกรอง: </span>
                    <span className="font-medium text-slate-800">{currentRound.screeningDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ผู้ประเมิน: </span>
                    <span className="font-medium text-slate-800">
                      {currentRound.surveyorName} ({currentRound.surveyorRole})
                    </span>
                  </div>
                  {currentRound.surveyorPhone && (
                    <div>
                      <span className="text-slate-400">เบอร์โทรผู้ประเมิน: </span>
                      <span className="font-medium text-slate-800">{currentRound.surveyorPhone}</span>
                    </div>
                  )}
                </div>

                {currentRound.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block mb-0.5">บันทึกเพิ่มเติม:</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                      {currentRound.notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {canModify && onAddNewRound && (
              <button
                type="button"
                onClick={() => onAddNewRound(patient)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>บันทึกประเมินครั้งที่ {rounds.length + 1}</span>
              </button>
            )}
            {canModify && (
              <button
                type="button"
                onClick={() => {
                  if (onEditRound && currentRound) {
                    onEditRound(patient, currentRound.roundId);
                  } else {
                    onEdit(patient);
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>แก้ไขรอบที่ {currentRound?.roundNumber || rounds.length}</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

