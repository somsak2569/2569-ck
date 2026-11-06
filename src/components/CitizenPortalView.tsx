import React from 'react';
import { PatientScreening, User } from '../types';
import { 
  HeartHandshake, 
  UserPlus, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  HelpCircle, 
  Smile, 
  Clock, 
  MapPin, 
  Building2, 
  ChevronRight, 
  FileText, 
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getRiskColorBadge, getStressLevelDetails, getOASRiskBadge } from '../utils/assessment';
import { EMERGENCY_CONTACTS } from '../data/chiangklangData';

interface CitizenPortalViewProps {
  currentUser: User;
  patients: PatientScreening[]; // Already filtered to this citizen's records
  onStartScreening: () => void;
  onViewPatient: (patient: PatientScreening) => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  currentUser,
  patients,
  onStartScreening,
  onViewPatient,
}) => {
  // Sort screenings descending by date
  const sortedAssessments = [...patients].sort((a, b) => {
    return new Date(b.screeningDate || b.updatedAt).getTime() - new Date(a.screeningDate || a.updatedAt).getTime();
  });

  const latestAssessment = sortedAssessments[0] || null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-24">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#9F1239] via-[#881337] to-[#BE185D] rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none transform translate-x-8"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-rose-950/60 border border-pink-400/30 text-pink-200 text-xs px-3 py-1 rounded-full font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ระบบประเมินสุขภาพใจตนเอง • บุคคลทั่วไป</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              ยินดีต้อนรับ คุณ{currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-pink-100 max-w-xl leading-relaxed">
              พื้นที่ประเมินสุขภาพจิตและคัดกรองอารมณ์ตนเองด้วยความปลอดภัย ข้อมูลของคุณจะถูกเก็บรักษาเป็นความลับเพื่อการดูแลส่งเสริมสุขภาพใจ
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-pink-200 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>ตำบล{currentUser.tambon} {currentUser.village && `(${currentUser.village})`}</span>
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-pink-300" />
                <span>{currentUser.hospital || 'รพ.สต. ในพื้นที่'}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartScreening}
            className="w-full sm:w-auto px-5 py-3.5 bg-pink-400 hover:bg-pink-300 active:bg-pink-500 text-rose-950 font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0 text-sm"
          >
            <UserPlus className="w-4 h-4 text-rose-950" />
            <span>ทำแบบประเมินสุขภาพตนเอง</span>
          </button>
        </div>
      </div>

      {/* Latest Assessment Summary Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              ผลการประเมินสุขภาพตนเองล่าสุด
            </h2>
          </div>
          {latestAssessment && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>ประเมินเมื่อ: {latestAssessment.screeningDate || latestAssessment.updatedAt?.slice(0, 10)}</span>
            </span>
          )}
        </div>

        {!latestAssessment ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-rose-100 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-rose-600 flex items-center justify-center mx-auto border-2 border-pink-100">
              <Smile className="w-8 h-8 text-rose-600" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-base text-slate-800">ยังไม่มีประวัติการประเมินตนเอง</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                ใช้เวลาเพียง 2-3 นาทีในการตรวจเช็กระดับความเครียดและภาวะอารมณ์ของคุณ เพื่อรับคำแนะนำการดูแลสุขภาพจิตที่เหมาะสม
              </p>
            </div>
            <button
              type="button"
              onClick={onStartScreening}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white font-bold rounded-xl shadow-md transition text-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>เริ่มทำแบบประเมินตนเองครั้งแรก</span>
            </button>
          </div>
        ) : (
          /* Detailed Latest Result Card */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            {/* Header Status Strip */}
            <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  แบบประเมินสุขภาพจิต (2Q Plus, 8Q และระดับความเครียด)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onViewPatient(latestAssessment)}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
              >
                <span>ดูรายละเอียดคำตอบทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Top 3 Result Grid: Stress, 2Q, 8Q */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Stress Level Card */}
                {(() => {
                  const stress = latestAssessment.stressAssessment;
                  const stressDetails = stress ? getStressLevelDetails(stress.level) : null;
                  return (
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2">
                          1. ระดับความเครียด (กรมสุขภาพจิต)
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl sm:text-4xl" role="img" aria-label="emoji">
                            {stress?.emoji || stressDetails?.emoji || '😐'}
                          </span>
                          <div>
                            <div className="text-sm sm:text-base font-extrabold text-slate-900">
                              {stress?.label || stressDetails?.label || 'ไม่ได้ระบุ'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {stress?.description || stressDetails?.description || ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-600">
                        เกณฑ์มาตรฐาน 5 ระดับ
                      </div>
                    </div>
                  );
                })()}

                {/* 2. 2Q Plus Depression Risk Card */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      2. คัดกรองอารมณ์เศร้า (2Q Plus)
                    </div>
                    {latestAssessment.twoQ.hasDepressionRisk ? (
                      <div className="flex items-start gap-2 text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">พบความเสี่ยงภาวะซึมเศร้า</div>
                          <div className="text-[11px] text-rose-600 mt-0.5 leading-snug">
                            มีอาการเศร้า ท้อแท้ หรือเบื่อหน่ายในช่วง 2 สัปดาห์
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold">ปกติ ไม่พบความเสี่ยง</div>
                          <div className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                            สภาวะอารมณ์แจ่มใสและเพลิดเพลินดี
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500">
                    แบบคัดกรอง 2 คำถามพร้อมคำถามคิดทำร้ายตนเอง
                  </div>
                </div>

                {/* 3. 8Q Suicide Risk Level Card */}
                {(() => {
                  const eightQ = latestAssessment.eightQ;
                  const riskBadge = getRiskColorBadge(eightQ?.riskLevel || 'NONE');
                  return (
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2">
                          3. ประเมินความเสี่ยงการฆ่าตัวตาย (8Q)
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${riskBadge.bg}`}>
                              <span className={`w-2 h-2 rounded-full ${riskBadge.badge}`}></span>
                              <span>{eightQ?.riskLabel || 'ไม่มีความเสี่ยง'}</span>
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {eightQ?.totalScore || 0} คะแนน
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {eightQ?.riskLevel === 'HIGH'
                              ? 'คะแนน >= 17 คะแนน (ระดับรุนแรง กรุณาปรึกษาบุคลากรทางการแพทย์โดยด่วน)'
                              : eightQ?.riskLevel === 'MEDIUM'
                              ? 'คะแนน 9-16 คะแนน (ระดับปานกลาง ควรได้รับการดูแลใกล้ชิด)'
                              : eightQ?.riskLevel === 'LOW'
                              ? 'คะแนน 1-8 คะแนน (ระดับน้อย เฝ้าระวังและพูดคุยระบาย)'
                              : '0 คะแนน (ไม่มีความเสี่ยง ปลอดภัย)'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500">
                        เกณฑ์มาตรฐาน 8 ข้อ กรมสุขภาพจิต
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Recommendations & Action Guidance */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-xs sm:text-sm">
                  <HelpCircle className="w-4 h-4 text-rose-700" />
                  <span>คำแนะนำและการดูแลสุขภาพใจสำหรับท่าน</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>หลัก 3 ส. กรมสุขภาพจิต:</strong> สอดส่องมองหา (สังเกตอารมณ์ตนเอง), ใส่ใจรับฟัง (พูดคุยกับคนที่ไว้ใจได้), ส่งต่อเชื่อมโยง (ขอความช่วยเหลือเมื่อรู้สึกไม่ไหว)
                  </li>
                  <li>
                    พักผ่อนให้เพียงพอ ออกกำลังกายเบาๆ และทำกิจกรรมที่ชอบหรือทำให้จิตใจผ่อนคลาย
                  </li>
                  {latestAssessment.eightQ?.riskLevel === 'HIGH' || latestAssessment.eightQ?.riskLevel === 'MEDIUM' ? (
                    <li className="text-rose-700 font-bold">
                      หากรู้สึกอึดอัด กังวลใจ หรือมีความคิดทำร้ายตนเอง กรุณาติดต่อสายด่วน 1323 หรือประสานเจ้าหน้าที่ รพ.สต. หรือ รพ.เชียงกลาง ทันที
                    </li>
                  ) : (
                    <li>
                      หมั่นสังเกตอารมณ์ของตนเองและทำแบบประเมินซ้ำอย่างสม่ำเสมอทุก 2-4 สัปดาห์
                    </li>
                  )}
                </ul>

                {/* Hotlines inside card */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href="tel:1323"
                    className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>โทรสายด่วนสุขภาพจิต 1323 (ฟรี 24 ชม.)</span>
                  </a>
                  <button
                    type="button"
                    onClick={onStartScreening}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>ทำแบบประเมินใหม่เพื่อติดตามผล</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History of Past Self-Assessments */}
      {sortedAssessments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-700" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                ประวัติการประเมินตนเอง ({sortedAssessments.length} ครั้ง)
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {sortedAssessments.map((assessment, idx) => {
              const stress = assessment.stressAssessment;
              const stressDetails = stress ? getStressLevelDetails(stress.level) : null;
              const eightQ = assessment.eightQ;
              const riskBadge = getRiskColorBadge(eightQ?.riskLevel || 'NONE');

              return (
                <div
                  key={assessment.id || idx}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200/80 flex items-center justify-center text-2xl shrink-0">
                      {stress?.emoji || stressDetails?.emoji || '😐'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {assessment.screeningDate || assessment.updatedAt?.slice(0, 10)}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            ล่าสุด
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge.bg}`}>
                          8Q: {eightQ?.riskLabel || 'ไม่มีความเสี่ยง'} ({eightQ?.totalScore || 0} คะแนน)
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>
                          ความเครียด: <strong>{stress?.label || stressDetails?.label || 'ปกติ'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          2Q+: {assessment.twoQ.hasDepressionRisk ? 'พบความเสี่ยง' : 'ปกติ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onViewPatient(assessment)}
                    className="self-end sm:self-auto px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-rose-400 hover:text-rose-700 bg-white text-slate-700 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                    <span>ดูผลฉบับเต็ม</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency Contacts Strip */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <PhoneCall className="w-4 h-4" />
          <span>เบอร์ติดต่อฉุกเฉินและขอความช่วยเหลือด้านสุขภาพจิต (อ.เชียงกลาง จ.น่าน)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div
              key={i}
              className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-white">{c.name}</div>
                <div className="text-[10px] text-slate-400">{c.note}</div>
              </div>
              <a
                href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition"
              >
                {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
