import React, { useState, useEffect } from 'react';
import { 
  PatientScreening, 
  User, 
  RiskLevel 
} from '../types';
import { 
  CHIANG_KLANG_TAMBONS, 
  CHRONIC_DISEASE_OPTIONS 
} from '../data/chiangklangData';
import { 
  EIGHT_Q_QUESTIONS, 
  evaluateTwoQ, 
  calculateEightQ, 
  getRiskColorBadge 
} from '../utils/assessment';
import { 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  PhoneCall, 
  Save, 
  X, 
  ArrowRight,
  Info,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScreeningFormProps {
  currentUser: User;
  editingPatient?: PatientScreening | null;
  onSave: (patient: PatientScreening) => void;
  onCancel: () => void;
}

export const ScreeningForm: React.FC<ScreeningFormProps> = ({
  currentUser,
  editingPatient,
  onSave,
  onCancel,
}) => {
  // 1. Patient Demographics State
  const [fullName, setFullName] = useState(editingPatient?.fullName || '');
  const [idCard, setIdCard] = useState(editingPatient?.idCard || '');
  const [age, setAge] = useState<number | ''>(editingPatient ? editingPatient.age : '');
  const [gender, setGender] = useState<'ชาย' | 'หญิง' | 'อื่นๆ'>(editingPatient?.gender || 'ชาย');
  const [addressNo, setAddressNo] = useState(editingPatient?.addressNo || '');
  
  // Tambon & Village
  const defaultTambon = editingPatient?.tambon 
    ? editingPatient.tambon 
    : (currentUser.tambon && currentUser.tambon !== 'ทั้งหมด' ? currentUser.tambon : 'เชียงกลาง');
  const [tambon, setTambon] = useState(defaultTambon);

  const availableVillages = CHIANG_KLANG_TAMBONS[tambon]?.villages || [];
  const defaultVillage = editingPatient?.villageName 
    ? editingPatient.villageName 
    : (currentUser.village && currentUser.village !== 'ทั้งหมด' ? currentUser.village : availableVillages[0] || '');
  const [villageName, setVillageName] = useState(defaultVillage);

  const availableHospitals = CHIANG_KLANG_TAMBONS[tambon]?.hospitals || [];
  const defaultHospital = editingPatient?.mentorHospital
    ? editingPatient.mentorHospital
    : (currentUser.hospital && currentUser.hospital !== 'สสอ.เชียงกลาง' ? currentUser.hospital : availableHospitals[0] || 'รพ.เชียงกลาง');
  const [mentorHospital, setMentorHospital] = useState(defaultHospital);

  const [phone, setPhone] = useState(editingPatient?.phone || '');
  const [chronicDiseases, setChronicDiseases] = useState<string[]>(editingPatient?.chronicDiseases || []);
  const [otherChronicDisease, setOtherChronicDisease] = useState(editingPatient?.otherChronicDisease || '');

  // Caregiver State
  const [caregiverName, setCaregiverName] = useState(editingPatient?.caregiverName || '');
  const [caregiverRelation, setCaregiverRelation] = useState(editingPatient?.caregiverRelation || '');
  const [caregiverPhone, setCaregiverPhone] = useState(editingPatient?.caregiverPhone || '');

  // 2. 2Q Plus State
  const [q1Depressed, setQ1Depressed] = useState<boolean>(editingPatient?.twoQ.q1Depressed || false);
  const [q2Anhedonia, setQ2Anhedonia] = useState<boolean>(editingPatient?.twoQ.q2Anhedonia || false);
  const [qPlusSelfHarm, setQPlusSelfHarm] = useState<boolean>(editingPatient?.twoQ.qPlusSelfHarm || false);

  // Derived 2Q status
  const twoQResult = evaluateTwoQ(q1Depressed, q2Anhedonia, qPlusSelfHarm);
  const is8QTriggered = twoQResult.hasDepressionRisk || !!editingPatient?.eightQTriggered;

  // 3. 8Q Assessment State
  const [eightQAnswers, setEightQAnswers] = useState({
    q1WishDead: editingPatient?.eightQ?.q1WishDead || 0,
    q2SelfHarmWant: editingPatient?.eightQ?.q2SelfHarmWant || 0,
    q3SuicideThought: editingPatient?.eightQ?.q3SuicideThought || 0,
    q4SuicidePlan: editingPatient?.eightQ?.q4SuicidePlan || 0,
    q5SuicidePrepare: editingPatient?.eightQ?.q5SuicidePrepare || 0,
    q6SelfHarmAttemptNonFatal: editingPatient?.eightQ?.q6SelfHarmAttemptNonFatal || 0,
    q7SuicideAttemptFatal: editingPatient?.eightQ?.q7SuicideAttemptFatal || 0,
    q8LifetimeAttempt: editingPatient?.eightQ?.q8LifetimeAttempt || 0,
  });

  // Calculate live 8Q score
  const eightQResult = calculateEightQ(eightQAnswers);

  // 4. Follow-up & Survey info
  const defaultFollowUp = (): 'ปกติไม่ต้องติดตาม' | 'ติดตามเฝ้าระวัง' | 'ส่งต่อ รพ.สต.' | 'ส่งต่อด่วน รพ.เชียงกลาง' => {
    if (editingPatient?.followUpStatus) return editingPatient.followUpStatus;
    if (!twoQResult.hasDepressionRisk) return 'ปกติไม่ต้องติดตาม';
    if (eightQResult.riskLevel === 'HIGH') return 'ส่งต่อด่วน รพ.เชียงกลาง';
    if (eightQResult.riskLevel === 'MEDIUM') return 'ส่งต่อ รพ.สต.';
    return 'ติดตามเฝ้าระวัง';
  };

  const [followUpStatus, setFollowUpStatus] = useState<'ปกติไม่ต้องติดตาม' | 'ติดตามเฝ้าระวัง' | 'ส่งต่อ รพ.สต.' | 'ส่งต่อด่วน รพ.เชียงกลาง'>(defaultFollowUp());
  const [notes, setNotes] = useState(editingPatient?.notes || '');
  const [screeningDate, setScreeningDate] = useState(editingPatient?.screeningDate || new Date().toISOString().slice(0, 10));

  // Update default follow-up when 8Q risk level shifts
  useEffect(() => {
    if (!editingPatient) {
      if (!twoQResult.hasDepressionRisk) {
        setFollowUpStatus('ปกติไม่ต้องติดตาม');
      } else if (eightQResult.riskLevel === 'HIGH') {
        setFollowUpStatus('ส่งต่อด่วน รพ.เชียงกลาง');
      } else if (eightQResult.riskLevel === 'MEDIUM') {
        setFollowUpStatus('ส่งต่อ รพ.สต.');
      } else {
        setFollowUpStatus('ติดตามเฝ้าระวัง');
      }
    }
  }, [twoQResult.hasDepressionRisk, eightQResult.riskLevel, editingPatient]);

  // Handle Tambon change -> update available villages and hospitals
  const handleTambonChange = (newTambon: string) => {
    setTambon(newTambon);
    const newVillages = CHIANG_KLANG_TAMBONS[newTambon]?.villages || [];
    setVillageName(newVillages[0] || '');
    const newHospitals = CHIANG_KLANG_TAMBONS[newTambon]?.hospitals || [];
    setMentorHospital(newHospitals[0] || '');
  };

  const toggleChronicDisease = (item: string) => {
    if (chronicDiseases.includes(item)) {
      setChronicDiseases(chronicDiseases.filter((c) => c !== item));
    } else {
      setChronicDiseases([...chronicDiseases, item]);
    }
  };

  const handleEightQChange = (key: keyof typeof eightQAnswers, val: number) => {
    setEightQAnswers((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('กรุณากรอกชื่อ-สกุล ของคนไข้');
      return;
    }

    if (!age || Number(age) < 1 || Number(age) > 130) {
      alert('กรุณากรอกอายุที่ถูกต้อง (1-130 ปี)');
      return;
    }

    const patientData: PatientScreening = {
      id: editingPatient ? editingPatient.id : `pt-${Date.now()}`,
      screeningDate,
      fullName: fullName.trim(),
      idCard: idCard.trim(),
      age: Number(age),
      gender,
      addressNo: addressNo.trim(),
      villageNo: villageName.split(' ')[0] || '',
      villageName,
      tambon,
      district: 'เชียงกลาง',
      province: 'น่าน',
      phone: phone.trim(),
      chronicDiseases,
      otherChronicDisease: otherChronicDisease.trim(),

      caregiverName: caregiverName.trim(),
      caregiverRelation: caregiverRelation.trim(),
      caregiverPhone: caregiverPhone.trim(),

      twoQ: twoQResult,
      eightQTriggered: is8QTriggered,
      eightQ: is8QTriggered ? eightQResult : undefined,

      mentorHospital,
      surveyorName: editingPatient?.surveyorName || currentUser.fullName,
      surveyorRole: editingPatient?.surveyorRole || currentUser.roleLabel,
      surveyorPhone: editingPatient?.surveyorPhone || currentUser.phone,
      surveyorUserId: editingPatient?.surveyorUserId || currentUser.id,

      followUpStatus,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (eightQResult.riskLevel === 'NONE' && !twoQResult.hasDepressionRisk) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    }

    onSave(patientData);
  };

  const riskBadge = getRiskColorBadge(is8QTriggered ? eightQResult.riskLevel : 'NONE');

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
      {/* Title Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {editingPatient ? 'แก้ไขแบบประเมินคัดกรอง' : 'บันทึกแบบประเมินคัดกรองคนไข้'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              ระบบคัดกรอง 2Q Plus และ 8Q กรมสุขภาพจิต • อ.เชียงกลาง จ.น่าน
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <span>ผู้ประเมิน: <strong className="text-slate-800">{currentUser.fullName}</strong></span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Patient Demographic & Chronic Disease */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-800 text-base">
              ข้อมูลทั่วไปคนไข้ (ผู้รับการประเมิน)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - สกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น นายคำปัน มะโนชัย"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อายุ (ปี) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={125}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="เช่น 56"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เพศ
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition bg-white"
              >
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            {/* ID Card */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวประชาชน (13 หลัก)
              </label>
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                placeholder="เช่น 3-5503-xxxxx-xx-x"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์คนไข้
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Address Information (Specific to Chiang Klang District) */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              ที่อยู่ (ในอำเภอเชียงกลาง จังหวัดน่าน)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">บ้านเลขที่</label>
                <input
                  type="text"
                  value={addressNo}
                  onChange={(e) => setAddressNo(e.target.value)}
                  placeholder="เช่น 45/2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  ตำบล <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tambon}
                  onChange={(e) => handleTambonChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white font-medium text-teal-900"
                >
                  {Object.keys(CHIANG_KLANG_TAMBONS).map((t) => (
                    <option key={t} value={t}>
                      ตำบล{t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  หมู่บ้าน <span className="text-rose-500">*</span>
                </label>
                <select
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white font-medium"
                >
                  {availableVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mentor Hospital */}
            <div className="mt-3">
              <label className="block text-xs text-slate-600 mb-1">
                รพ.สต. พี่เลี้ยง ในเขตรับผิดชอบ
              </label>
              <select
                value={mentorHospital}
                onChange={(e) => setMentorHospital(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-slate-50 font-medium text-slate-800"
              >
                {availableHospitals.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chronic Diseases & Risk Factors */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              โรคประจำตัว / ปัจจัยเสี่ยงที่ตรวจพบ (เลือกได้มากกว่า 1 ข้อ)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {CHRONIC_DISEASE_OPTIONS.map((item) => {
                const checked = chronicDiseases.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleChronicDisease(item)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition ${
                      checked
                        ? 'border-teal-500 bg-teal-50/80 text-teal-900 font-medium shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                        checked
                          ? 'bg-teal-600 border-teal-600 text-white font-bold'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {checked && '✓'}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={otherChronicDisease}
                onChange={(e) => setOtherChronicDisease(e.target.value)}
                placeholder="ระบุโรคประจำตัว หรือปัจจัยเสี่ยงอื่นๆ เพิ่มเติม (ถ้ามี)..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Caregiver Information */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              ข้อมูลผู้ดูแล (Caregiver / ญาติใกล้ชิด)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">ชื่อ - สกุล ผู้ดูแล</label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="เช่น นางบัวลอย วงศ์เมืองน่าน"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">ความสัมพันธ์กับคนไข้</label>
                <input
                  type="text"
                  value={caregiverRelation}
                  onChange={(e) => setCaregiverRelation(e.target.value)}
                  placeholder="เช่น ภรรยา, บุตร, มารดา, เพื่อนบ้าน"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">เบอร์โทรศัพท์ผู้ดูแล</label>
                <input
                  type="tel"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  placeholder="เช่น 089-112-3345"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: 2Q PLUS Assessment */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  แบบประเมินความเสี่ยงโรคซึมเศร้าและฆ่าตัวตาย (2Q Plus)
                </h3>
                <p className="text-xs text-slate-500">
                  ในช่วง 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  twoQResult.hasDepressionRisk
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {twoQResult.hasDepressionRisk ? '⚠️ พบความเสี่ยง' : '✓ ปกติ'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Question 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-slate-800 font-medium">
                  <span className="font-bold text-teal-700 mr-1.5">ข้อ 1:</span>
                  ใน 2 สัปดาห์ที่ผ่านมารวมวันนี้ <span className="font-semibold text-slate-900">ท่านรู้สึกหดหู่ เศร้า หรือท้อแท้สิ้นหวังหรือไม่</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setQ1Depressed(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      !q1Depressed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ไม่มี
                  </button>
                  <button
                    type="button"
                    onClick={() => setQ1Depressed(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      q1Depressed
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    มี
                  </button>
                </div>
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-slate-800 font-medium">
                  <span className="font-bold text-teal-700 mr-1.5">ข้อ 2:</span>
                  ใน 2 สัปดาห์ที่ผ่านมารวมวันนี้ <span className="font-semibold text-slate-900">ท่านรู้สึกเบื่อ ทำอะไรก็ไม่เพลิดเพลินหรือไม่</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setQ2Anhedonia(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      !q2Anhedonia
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ไม่มี
                  </button>
                  <button
                    type="button"
                    onClick={() => setQ2Anhedonia(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      q2Anhedonia
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    มี
                  </button>
                </div>
              </div>
            </div>

            {/* Question Plus */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-slate-800 font-medium">
                  <span className="font-bold text-amber-700 mr-1.5">ข้อ Plus:</span>
                  ใน 2 สัปดาห์ที่ผ่านมารวมวันนี้ <span className="font-semibold text-slate-900">ท่านมีความคิดอยากทำร้ายตนเอง หรือคิดว่าตายไปจะดีกว่าหรือไม่</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setQPlusSelfHarm(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      !qPlusSelfHarm
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ไม่มี
                  </button>
                  <button
                    type="button"
                    onClick={() => setQPlusSelfHarm(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      qPlusSelfHarm
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    มี
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2Q Interpretation Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
              twoQResult.hasDepressionRisk
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            {twoQResult.hasDepressionRisk ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm">
              {twoQResult.hasDepressionRisk ? (
                <>
                  <div className="font-bold text-amber-900">
                    แปลผล 2Q Plus: มีความเสี่ยงซึมเศร้า (ตอบ "มี" อย่างน้อย 1 ข้อ)
                  </div>
                  <div className="text-amber-800 mt-0.5 text-xs">
                    ระบบเปิดแบบประเมินการฆ่าตัวตาย (8Q) อัตโนมัติตามเกณฑ์กรมสุขภาพจิต เพื่อประเมินระดับความรุนแรงและวางแผนการช่วยเหลือทันที
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-emerald-900">
                    แปลผล 2Q Plus: ปกติ / ไม่พบความเสี่ยงโรคซึมเศร้าในปัจจุบัน
                  </div>
                  <div className="text-emerald-800 mt-0.5 text-xs">
                    ตอบ "ไม่มี" ครบทั้ง 3 ข้อ แนะนำให้กำลังใจและติดตามตามรอบปกติ
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: 8Q Suicide Risk Assessment (Auto-triggered when 2Q is positive or manually opened) */}
        {is8QTriggered ? (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-rose-200 p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>แบบประเมินการฆ่าตัวตาย (8Q) กรมสุขภาพจิต</span>
                    <span className="bg-rose-100 text-rose-800 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-rose-200">
                      8 ข้อคำถาม
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ข้อ 1-7 ในช่วง 1 เดือนที่ผ่านมา และ ข้อ 8 ตลอดชีวิตที่ผ่านมา
                  </p>
                </div>
              </div>

              {/* Live Score Display */}
              <div className="flex items-center gap-2 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] text-rose-700 font-semibold uppercase">คะแนนรวม 8Q</div>
                  <div className="text-lg font-bold text-rose-800 leading-none">
                    {eightQResult.totalScore} <span className="text-xs font-normal text-slate-600">คะแนน</span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${riskBadge.badge}`}>
                  {riskBadge.label}
                </div>
              </div>
            </div>

            {/* 8Q Questions List */}
            <div className="space-y-3">
              {EIGHT_Q_QUESTIONS.map((q) => {
                const currentScore = eightQAnswers[q.id as keyof typeof eightQAnswers];
                const isYes = currentScore > 0;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isYes
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-slate-800">
                          <span className="text-teal-700 mr-1.5">ข้อที่ {q.number}:</span>
                          {q.question}
                          {isYes && (
                            <span className="ml-2 text-xs font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                              +{q.yesScore} คะแนน
                            </span>
                          )}
                        </div>
                        {q.subText && (
                          <div className="text-xs text-slate-500 leading-tight">
                            {q.subText}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleEightQChange(q.id as keyof typeof eightQAnswers, q.noScore)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            !isYes
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ไม่มี (0)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEightQChange(q.id as keyof typeof eightQAnswers, q.yesScore)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            isYes
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          มี (+{q.yesScore})
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 8Q Interpretation & Action Guide */}
            <div className={`p-4 rounded-xl border ${riskBadge.bg} space-y-2 mt-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-700" />
                  <span className="font-bold text-sm">
                    ผลการประเมิน 8Q: {eightQResult.riskLabel}
                  </span>
                </div>
              </div>

              {/* Clinical Intervention Guidance based on Score */}
              <div className="text-xs text-slate-700 space-y-1.5 pt-1">
                {eightQResult.riskLevel === 'HIGH' && (
                  <div className="bg-white/90 p-3 rounded-lg border border-rose-300 text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-700">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      แนวทางปฏิบัติกรณีเสี่ยงรุนแรง (คะแนน &gt;= 17):
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-rose-800">
                      <li><strong>ห้ามปล่อยให้อยู่ตามลำพังเด็ดขาด</strong> ตลอด 24 ชั่วโมง</li>
                      <li>ให้ญาติหรือผู้ดูแลเก็บสิ่งของอันตราย (เชือก อาวุธ ยาฆ่าแมลง ยาเม็ดจำนวนมาก)</li>
                      <li>ประสานส่งต่อด่วนไปยัง <strong>รพ.เชียงกลาง (054-791111)</strong> หรือสายด่วน <strong>1669 / 1323</strong></li>
                      <li>แจ้ง รพ.สต. พี่เลี้ยง และผู้ดูแลระบบ สสอ. เพื่อติดตามต่อเนื่อง</li>
                    </ul>
                  </div>
                )}

                {eightQResult.riskLevel === 'MEDIUM' && (
                  <div className="bg-white/90 p-3 rounded-lg border border-amber-300 text-amber-900 space-y-1">
                    <div className="font-bold text-amber-800">
                      แนวทางปฏิบัติกรณีเสี่ยงปานกลาง (คะแนน 9 - 16):
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-amber-900">
                      <li>ส่งต่อ รพ.สต. พี่เลี้ยง เพื่อให้พยาบาลหรือแพทย์ตรวจประเมินซ้ำ</li>
                      <li>ทีม อสม. เยี่ยมบ้านติดตามอาการสัปดาห์ละ 1-2 ครั้ง</li>
                      <li>ให้เบอร์ติดต่อญาติ และสายด่วนสุขภาพจิต 1323</li>
                    </ul>
                  </div>
                )}

                {eightQResult.riskLevel === 'LOW' && (
                  <div className="bg-white/90 p-3 rounded-lg border border-yellow-200 text-yellow-900 space-y-1">
                    <div className="font-bold text-yellow-800">
                      แนวทางปฏิบัติกรณีเสี่ยงน้อย (คะแนน 1 - 8):
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-yellow-900">
                      <li>รับฟังด้วยความเข้าใจ ให้กำลังใจ แนะนำการคลายเครียด</li>
                      <li>อสม. ติดตามเยี่ยมซ้ำภายใน 2 สัปดาห์</li>
                    </ul>
                  </div>
                )}

                {eightQResult.riskLevel === 'NONE' && (
                  <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-300 text-emerald-900 text-xs">
                    ไม่พบแนวโน้มการฆ่าตัวตายในปัจจุบัน ให้คำแนะนำดูแลสุขภาพทั่วไป
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-2">
              แบบประเมิน 8Q ถูกซ่อนอยู่เนื่องจากผล 2Q Plus ไม่มีข้อใดตอบว่า "มี"
            </p>
            <button
              type="button"
              onClick={() => setQ1Depressed(true)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline inline-flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              ต้องการเปิดทำแบบประเมิน 8Q เพิ่มเติมด้วยตนเอง คลิกที่นี่
            </button>
          </div>
        )}

        {/* SECTION 4: Follow-up Status & Notes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-800 text-base">
              แผนการดูแล / ส่งต่อ และบันทึกเพิ่มเติม
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการติดตาม / ส่งต่อ <span className="text-rose-500">*</span>
              </label>
              <select
                value={followUpStatus}
                onChange={(e) => setFollowUpStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition bg-white font-medium"
              >
                <option value="ปกติไม่ต้องติดตาม">ปกติไม่ต้องติดตาม</option>
                <option value="ติดตามเฝ้าระวัง">ติดตามเฝ้าระวัง (เยี่ยมบ้านสม่ำเสมอ)</option>
                <option value="ส่งต่อ รพ.สต.">ส่งต่อ รพ.สต. พี่เลี้ยง</option>
                <option value="ส่งต่อด่วน รพ.เชียงกลาง">ส่งต่อด่วน รพ.เชียงกลาง (เสี่ยงรุนแรง)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ประเมิน
              </label>
              <input
                type="date"
                value={screeningDate}
                onChange={(e) => setScreeningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / บันทึกข้อสังเกตเพิ่มเติมของ อสม. หรือ เจ้าหน้าที่ รพ.สต.
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ผู้ป่วยเล่าว่าเครียดจากพืชผลการเกษตรเสียหาย ญาติให้ความร่วมมือดี นัดเยี่ยมบ้านสัปดาห์หน้า..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm outline-none transition"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingPatient ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลแบบประเมิน'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
