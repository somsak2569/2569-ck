import React from 'react';
import { PatientScreening, User } from '../types';
import { getRiskColorBadge, EIGHT_Q_QUESTIONS } from '../utils/assessment';
import { 
  X, 
  PhoneCall, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Printer, 
  Calendar, 
  UserCheck, 
  Building2,
  HeartPulse
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: PatientScreening;
  currentUser: User;
  onClose: () => void;
  onEdit: (patient: PatientScreening) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  currentUser,
  onClose,
  onEdit,
}) => {
  const riskBadge = getRiskColorBadge(patient.eightQ?.riskLevel || 'NONE');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-teal-800 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-teal-700 text-teal-200 px-2 py-0.5 rounded font-mono">
                HN/ID: {patient.id}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${riskBadge.badge}`}>
                {patient.eightQ ? `8Q: ${patient.eightQ.totalScore} คะแนน (${riskBadge.label})` : '2Q ปกติ'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {patient.fullName}
            </h2>
            <p className="text-xs text-teal-200">
              เพศ {patient.gender} • อายุ {patient.age} ปี • {patient.villageName}, ตำบล{patient.tambon}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 text-teal-200 hover:text-white rounded-lg transition"
              title="พิมพ์เอกสาร"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-teal-200 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* High risk emergency warning */}
          {patient.eightQ?.riskLevel === 'HIGH' && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-800 text-sm">
                  ผู้ป่วยมีความเสี่ยงฆ่าตัวตายระดับรุนแรง (8Q = {patient.eightQ.totalScore} คะแนน)
                </div>
                <div className="text-xs text-rose-700 leading-relaxed">
                  ต้องเฝ้าระวังไม่ให้อยู่ตามลำพังเด็ดขาด เก็บสิ่งของอันตราย และประสานส่งต่อจิตแพทย์ รพ.เชียงกลาง ทันที
                </div>
                <div className="pt-1 flex gap-2">
                  <a
                    href="tel:054791111"
                    className="inline-flex items-center gap-1 bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs"
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
              <div>
                <span className="text-slate-400">เลขประจำตัวประชาชน: </span>
                <span className="font-medium text-slate-800">{patient.idCard || 'ไม่ได้ระบุ'}</span>
              </div>
              <div>
                <span className="text-slate-400">เบอร์โทรศัพท์: </span>
                {patient.phone ? (
                  <a href={`tel:${patient.phone}`} className="font-medium text-teal-700 underline">
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
                <span className="font-medium text-teal-800">{patient.mentorHospital}</span>
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
                    className="bg-teal-100 text-teal-900 font-medium px-2.5 py-0.5 rounded-full text-xs"
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
                    className="font-bold text-teal-700 inline-flex items-center gap-1 hover:underline"
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

          {/* Section: 2Q Plus Answers Breakdown */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                ผลการคัดกรอง 2Q Plus
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  patient.twoQ.hasDepressionRisk
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {patient.twoQ.hasDepressionRisk ? 'พบความเสี่ยงซึมเศร้า' : 'ปกติ'}
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span>1. รู้สึกหดหู่ เศร้า ท้อแท้สิ้นหวัง</span>
                <span className={patient.twoQ.q1Depressed ? 'font-bold text-rose-600' : 'text-slate-600'}>
                  {patient.twoQ.q1Depressed ? 'มี' : 'ไม่มี'}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span>2. รู้สึกเบื่อ ไม่เพลิดเพลิน</span>
                <span className={patient.twoQ.q2Anhedonia ? 'font-bold text-rose-600' : 'text-slate-600'}>
                  {patient.twoQ.q2Anhedonia ? 'มี' : 'ไม่มี'}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                <span className="font-medium text-amber-900">Plus: ความคิดอยากทำร้ายตนเองหรือตายไปจะดีกว่า</span>
                <span className={patient.twoQ.qPlusSelfHarm ? 'font-bold text-rose-600' : 'text-slate-600'}>
                  {patient.twoQ.qPlusSelfHarm ? 'มี' : 'ไม่มี'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: 8Q Answers Breakdown (If executed) */}
          {patient.eightQ && (
            <div className="p-4 rounded-2xl border border-rose-200 bg-white space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-rose-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    แบบประเมินการฆ่าตัวตาย (8Q) กรมสุขภาพจิต
                  </h3>
                  <div className="text-xs text-rose-700 font-bold">
                    คะแนนรวม: {patient.eightQ.totalScore} คะแนน • {patient.eightQ.riskLabel}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {EIGHT_Q_QUESTIONS.map((q) => {
                  const score = patient.eightQ![q.id as keyof typeof patient.eightQ] as number;
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
              ข้อมูลการติดตามและผู้ประเมิน
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">สถานะการดูแล: </span>
                <span className="font-bold text-teal-800">{patient.followUpStatus}</span>
              </div>
              <div>
                <span className="text-slate-400">วันที่คัดกรอง: </span>
                <span className="font-medium text-slate-800">{patient.screeningDate}</span>
              </div>
              <div>
                <span className="text-slate-400">ผู้ประเมิน: </span>
                <span className="font-medium text-slate-800">
                  {patient.surveyorName} ({patient.surveyorRole})
                </span>
              </div>
              {patient.surveyorPhone && (
                <div>
                  <span className="text-slate-400">เบอร์โทรผู้ประเมิน: </span>
                  <span className="font-medium text-slate-800">{patient.surveyorPhone}</span>
                </div>
              )}
            </div>

            {patient.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block mb-0.5">บันทึกเพิ่มเติม:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                  {patient.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => onEdit(patient)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            แก้ไขแบบประเมินนี้
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
