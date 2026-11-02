import { EightQAnswers, RiskLevel, TwoQPlusAnswers, StressLevel, StressAssessment, OASAssessment } from '../types';

export interface StressLevelOption {
  level: StressLevel;
  score: number;
  label: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
}

// 5 ระดับความเครียดตามเกณฑ์มาตรฐานกรมสุขภาพจิต (Mental Health Check-in / ST-5)
export const STRESS_LEVEL_OPTIONS: StressLevelOption[] = [
  {
    level: 'NONE',
    score: 1,
    label: 'ไม่เครียด',
    title: 'ระดับที่ 1: ไม่เครียด (No Stress)',
    emoji: '😃',
    description: 'อารมณ์ดี มีความสุข สดชื่นแจ่มใส ไม่มีเรื่องวิตกกังวล สภาพจิตใจปกติ ใช้ชีวิตประจำวันได้อย่างราบรื่นและผ่อนคลาย',
    color: '#10b981', // emerald-500
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgClass: 'bg-emerald-50/80',
    borderClass: 'border-emerald-300',
  },
  {
    level: 'LOW',
    score: 2,
    label: 'เครียดน้อย',
    title: 'ระดับที่ 2: เครียดน้อย (Low Stress)',
    emoji: '😊',
    description: 'จิตใจผ่องใส มีความกังวลหรือเหนื่อยล้าเพียงเล็กน้อย สามารถปรับตัวรับมือกับชีวิตประจำวันได้ดี พักผ่อนและผ่อนคลายได้ด้วยตนเอง',
    color: '#06b6d4', // cyan-500
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    bgClass: 'bg-cyan-50/80',
    borderClass: 'border-cyan-300',
  },
  {
    level: 'MILD',
    score: 3,
    label: 'เครียดปานกลาง',
    title: 'ระดับที่ 3: เครียดปานกลาง (Mild/Moderate Stress)',
    emoji: '😐',
    description: 'มีความกังวลหรือตึงเครียดจากภาระหน้าที่/ปัญหาชีวิต เริ่มเหนื่อยล้า แต่ยังสามารถควบคุมอารมณ์และดำเนินชีวิตได้',
    color: '#3b82f6', // blue-500
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    bgClass: 'bg-blue-50/80',
    borderClass: 'border-blue-300',
  },
  {
    level: 'MODERATE',
    score: 4,
    label: 'เครียดสูง',
    title: 'ระดับที่ 4: เครียดสูง (High Stress)',
    emoji: '😟',
    description: 'วิตกกังวลสูง นอนไม่ค่อยหลับ หงุดหงิดง่าย สมาธิลดลง เริ่มส่งผลกระทบต่อสุขภาพ การทำงาน และการใช้ชีวิตประจำวัน',
    color: '#f59e0b', // amber-500
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    bgClass: 'bg-amber-50/80',
    borderClass: 'border-amber-300',
  },
  {
    level: 'SEVERE',
    score: 5,
    label: 'เครียดรุนแรงมาก',
    title: 'ระดับที่ 5: เครียดรุนแรงมาก (Severe Stress)',
    emoji: '😫',
    description: 'เครียดจนหมดพลัง ท้อแท้สิ้นหวัง กินไม่ได้นอนไม่หลับ ปวดศีรษะหรือแน่นหน้าอก เสี่ยงต่อภาวะซึมเศร้า ควรได้รับการดูแลช่วยเหลือทันที',
    color: '#ef4444', // red-500
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    bgClass: 'bg-rose-50/80',
    borderClass: 'border-rose-300',
  },
];

export const getStressLevelDetails = (level?: StressLevel): StressLevelOption => {
  const found = STRESS_LEVEL_OPTIONS.find((opt) => opt.level === level);
  return found || STRESS_LEVEL_OPTIONS[0];
};

export interface QuestionItem {
  id: string;
  number: number;
  question: string;
  subText?: string;
  yesScore: number;
  noScore: number;
}

export const EIGHT_Q_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1WishDead',
    number: 1,
    question: 'ท่านคิดอยากตาย หรือคิดว่าตายไปจะดีกว่า',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา รู้สึกไม่อยากมีชีวิตอยู่ต่อ',
    yesScore: 1,
    noScore: 0,
  },
  {
    id: 'q2SelfHarmWant',
    number: 2,
    question: 'ท่านอยากทำร้ายตัวเอง หรือทำให้ตัวเองบาดเจ็บ',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา มีความคิดอยากกรีดแขน ทุบตี หรือทำร้ายร่างกายตนเอง',
    yesScore: 2,
    noScore: 0,
  },
  {
    id: 'q3SuicideThought',
    number: 3,
    question: 'ท่านคิดเกี่ยวกับการฆ่าตัวตาย',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา คิดถึงวิธีการ หรือคิดวนเวียนเรื่องจบชีวิต',
    yesScore: 6,
    noScore: 0,
  },
  {
    id: 'q4SuicidePlan',
    number: 4,
    question: 'ท่านมีแผนการที่จะฆ่าตัวตาย',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา มีการวางแผนเวลา สถานที่ หรือเตรียมวิธีการไว้แล้ว',
    yesScore: 8,
    noScore: 0,
  },
  {
    id: 'q5SuicidePrepare',
    number: 5,
    question: 'ท่านได้เตรียมการที่จะทำร้ายตนเองหรือเตรียมการจะฆ่าตัวตาย โดยตั้งใจว่าจะให้ตายจริง ๆ',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา เช่น ซื้อเชือก ยาฆ่าแมลง เขียนจดหมายลาตาย จัดการทรัพย์สิน',
    yesScore: 9,
    noScore: 0,
  },
  {
    id: 'q6SelfHarmAttemptNonFatal',
    number: 6,
    question: 'ท่านได้ทำให้ตนเองบาดเจ็บ แต่ไม่ได้ตั้งใจที่จะทำให้เสียชีวิต',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา ทำร้ายตนเองเพื่อระบายอารมณ์หรือเรียกร้องความช่วยเหลือ',
    yesScore: 4,
    noScore: 0,
  },
  {
    id: 'q7SuicideAttemptFatal',
    number: 7,
    question: 'ท่านได้พยายามฆ่าตัวตาย โดยคาดหวังหรือตั้งใจที่จะให้เสียชีวิต',
    subText: 'ในช่วง 1 เดือนที่ผ่านมา ได้ลงมือกระทำเพื่อต้องการให้เสียชีวิตจริง ๆ แต่รอดชีวิตมาได้',
    yesScore: 10,
    noScore: 0,
  },
  {
    id: 'q8LifetimeAttempt',
    number: 8,
    question: 'ตลอดชีวิตที่ผ่านมา ท่านเคยพยายามฆ่าตัวตาย',
    subText: 'ในอดีตที่ผ่านมาทั้งหมด เคยมีประวัติการพยายามทำร้ายตนเองเพื่อจบชีวิตหรือไม่',
    yesScore: 4,
    noScore: 0,
  },
];

export const evaluateTwoQ = (q1: boolean, q2: boolean, qPlus: boolean): TwoQPlusAnswers => {
  const hasRisk = q1 || q2 || qPlus;
  return {
    q1Depressed: q1,
    q2Anhedonia: q2,
    qPlusSelfHarm: qPlus,
    hasDepressionRisk: hasRisk,
  };
};

export const calculateEightQ = (answers: {
  q1WishDead: number;
  q2SelfHarmWant: number;
  q3SuicideThought: number;
  q4SuicidePlan: number;
  q5SuicidePrepare: number;
  q6SelfHarmAttemptNonFatal: number;
  q7SuicideAttemptFatal: number;
  q8LifetimeAttempt: number;
}): EightQAnswers => {
  const total =
    answers.q1WishDead +
    answers.q2SelfHarmWant +
    answers.q3SuicideThought +
    answers.q4SuicidePlan +
    answers.q5SuicidePrepare +
    answers.q6SelfHarmAttemptNonFatal +
    answers.q7SuicideAttemptFatal +
    answers.q8LifetimeAttempt;

  let riskLevel: RiskLevel = 'NONE';
  let riskLabel = 'ไม่มีแนวโน้มที่จะฆ่าตัวตายในปัจจุบัน (0 คะแนน)';

  if (total >= 17) {
    riskLevel = 'HIGH';
    riskLabel = `มีแนวโน้มที่จะฆ่าตัวตายในระดับ "รุนแรง" (${total} คะแนน)`;
  } else if (total >= 9) {
    riskLevel = 'MEDIUM';
    riskLabel = `มีแนวโน้มที่จะฆ่าตัวตายในระดับ "ปานกลาง" (${total} คะแนน)`;
  } else if (total >= 1) {
    riskLevel = 'LOW';
    riskLabel = `มีแนวโน้มที่จะฆ่าตัวตายในระดับ "น้อย" (${total} คะแนน)`;
  }

  return {
    ...answers,
    totalScore: total,
    riskLevel,
    riskLabel,
  };
};

export const getRiskColorBadge = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'HIGH':
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        badge: 'bg-rose-600 text-white',
        text: 'text-rose-700',
        label: 'รุนแรงมาก',
        lightBg: 'bg-rose-50',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        badge: 'bg-amber-500 text-white',
        text: 'text-amber-700',
        label: 'ปานกลาง',
        lightBg: 'bg-amber-50',
      };
    case 'LOW':
      return {
        bg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
        badge: 'bg-yellow-500 text-white',
        text: 'text-yellow-700',
        label: 'น้อย',
        lightBg: 'bg-yellow-50',
      };
    case 'NONE':
    default:
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-700',
        label: 'ไม่มีความเสี่ยง/ปกติ',
        lightBg: 'bg-emerald-50',
      };
  }
};

// ==========================================
// แบบประเมินพฤติกรรมก้าวร้าวรุนแรง (Overt Aggression Scale: OAS)
// สำหรับเจ้าหน้าที่ รพ.สต./พี่เลี้ยง เป็นผู้ประเมินและบันทึก
// ==========================================

export interface OASCategoryOption {
  score: number;
  label: string;
  description: string;
}

export interface OASCategoryItem {
  id: 'verbalScore' | 'propertyScore' | 'selfScore' | 'otherScore';
  title: string;
  subtitle: string;
  iconName: string;
  options: OASCategoryOption[];
}

export const OAS_CATEGORIES: OASCategoryItem[] = [
  {
    id: 'verbalScore',
    title: '1. พฤติกรรมก้าวร้าวทางวาจา (Verbal Aggression)',
    subtitle: 'การแสดงออกทางวาจา น้ำเสียง การข่มขู่ หรือการใช้คำพูดรุนแรง',
    iconName: 'Megaphone',
    options: [
      { score: 0, label: '0 คะแนน: ปกติ (None)', description: 'ไม่มีพฤติกรรมก้าวร้าวทางวาจา พูดคุยด้วยน้ำเสียงปกติ สงบ' },
      { score: 1, label: '1 คะแนน: เล็กน้อย', description: 'ตะโกน พูดเสียงดัง แสดงความโกรธเคือง/ไม่พอใจ โดยไม่ระบุเจาะจงบุคคล' },
      { score: 2, label: '2 คะแนน: ปานกลาง', description: 'ด่าทอ หยาบคาย สาปแช่ง หรือเหยียดหยามผู้อื่นอย่างชัดเจน' },
      { score: 3, label: '3 คะแนน: รุนแรง', description: 'ข่มขู่ว่าจะทำร้ายร่างกายผู้อื่น หรือข่มขู่ว่าจะทำร้ายตนเอง' },
      { score: 4, label: '4 คะแนน: รุนแรงมาก', description: 'ข่มขู่ว่าจะทำร้ายอย่างรุนแรงชัดเจน ขู่อาฆาตเอาชีวิต หรือขู่ใช้อาวุธ' },
    ],
  },
  {
    id: 'propertyScore',
    title: '2. พฤติกรรมก้าวร้าวต่อสิ่งของ/ทรัพย์สิน (Physical Aggression against Objects)',
    subtitle: 'การกระทำต่อสิ่งแวดล้อม ข้าวของเครื่องใช้ หรือทรัพย์สิน',
    iconName: 'Hammer',
    options: [
      { score: 0, label: '0 คะแนน: ปกติ (None)', description: 'ดูแลรักษาข้าวของปกติ ไม่ทำลายสิ่งของ' },
      { score: 1, label: '1 คะแนน: เล็กน้อย', description: 'ทุบโต๊ะ ปิดประตูกระแทกเสียงดัง เตะเก้าอี้ ไม่เกิดความเสียหายต่อทรัพย์สิน' },
      { score: 2, label: '2 คะแนน: ปานกลาง', description: 'ขว้างปาสิ่งของ ขูดขีดสิ่งของ ทำลายสิ่งของชิ้นเล็กเสียหายเล็กน้อย' },
      { score: 3, label: '3 คะแนน: รุนแรง', description: 'ทุบกระจกแตก พังประตู ขว้างปาสิ่งของใส่ผู้อื่น/กำแพงจนเกิดความเสียหาย' },
      { score: 4, label: '4 คะแนน: รุนแรงมาก', description: 'วางเพลิง จุดไฟเผา พังทำลายทรัพย์สินชิ้นใหญ่เสียหายรุนแรง' },
    ],
  },
  {
    id: 'selfScore',
    title: '3. พฤติกรรมก้าวร้าวทำร้ายตนเอง (Physical Aggression against Self)',
    subtitle: 'พฤติกรรมที่ก่อให้เกิดอันตรายหรือบาดแผลต่อร่างกายตนเอง',
    iconName: 'UserX',
    options: [
      { score: 0, label: '0 คะแนน: ปกติ (None)', description: 'ไม่มีพฤติกรรมทำร้ายตนเอง' },
      { score: 1, label: '1 คะแนน: เล็กน้อย', description: 'ดึงผม หยิก ข่วน ต่อยตนเอง ไม่ทำให้เกิดบาดแผล' },
      { score: 2, label: '2 คะแนน: ปานกลาง', description: 'ทุบตีตนเอง เอาศีรษะโขก เกิดรอยฟกช้ำ แผลตื้น มีรอยไหม้เล็กน้อย' },
      { score: 3, label: '3 คะแนน: รุนแรง', description: 'กรีดข้อมือ/ผิวหนัง บาดแผลลึก มีเลือดออก หรือกลืนสิ่งแปลกปลอม' },
      { score: 4, label: '4 คะแนน: รุนแรงมาก', description: 'ทำร้ายตนเองรุนแรง เป็นอันตรายต่อชีวิต ต้องได้รับการรักษาฉุกเฉิน' },
    ],
  },
  {
    id: 'otherScore',
    title: '4. พฤติกรรมก้าวร้าวทำร้ายผู้อื่น (Physical Aggression against Others)',
    subtitle: 'การใช้กำลังประทุษร้าย คุกคาม หรือทำอันตรายต่อร่างกายบุคคลอื่น',
    iconName: 'ShieldAlert',
    options: [
      { score: 0, label: '0 คะแนน: ปกติ (None)', description: 'ไม่มีพฤติกรรมคุกคามหรือทำร้ายร่างกายผู้อื่น' },
      { score: 1, label: '1 คะแนน: เล็กน้อย', description: 'ทำท่าทางคุกคาม ยื้อแย่ง ผลัก หรือกระชากเสื้อผ้าผู้อื่น' },
      { score: 2, label: '2 คะแนน: ปานกลาง', description: 'ตบ ชก เตะ ดึงผม ทำให้ผู้อื่นเกิดรอยฟกช้ำเล็กน้อย ไม่ฉีกขาด' },
      { score: 3, label: '3 คะแนน: รุนแรง', description: 'ทำร้ายผู้อื่นจนเกิดบาดแผลฉีกขาด ฟันหัก หรือเลือดออก' },
      { score: 4, label: '4 คะแนน: รุนแรงมาก', description: 'ทำร้ายร่างกายผู้อื่นรุนแรง ทำให้สลบ กระดูกหัก อวัยวะฉีกขาด หรือใช้อาวุธ' },
    ],
  },
];

export const calculateOAS = (
  verbalScore: number = 0,
  propertyScore: number = 0,
  selfScore: number = 0,
  otherScore: number = 0,
  meta?: {
    assessedByRole?: string;
    assessedByName?: string;
    assessedDate?: string;
    notes?: string;
  }
): OASAssessment => {
  const total = (verbalScore || 0) + (propertyScore || 0) + (selfScore || 0) + (otherScore || 0);
  let riskLevel: RiskLevel = 'NONE';
  let riskLabel = 'ปกติ / ไม่พบพฤติกรรมก้าวร้าว';

  // หากมีข้อใดข้อหนึ่งได้ 4 คะแนน หรือคะแนนรวม >= 9 ถือเป็นระดับรุนแรงมาก (Severe)
  if (verbalScore === 4 || propertyScore === 4 || selfScore === 4 || otherScore === 4 || total >= 9) {
    riskLevel = 'HIGH';
    riskLabel = `ความก้าวร้าวระดับรุนแรงมาก (${total} คะแนน)`;
  } else if (total >= 4) {
    riskLevel = 'MEDIUM';
    riskLabel = `ความก้าวร้าวระดับปานกลาง (${total} คะแนน)`;
  } else if (total >= 1) {
    riskLevel = 'LOW';
    riskLabel = `ความก้าวร้าวระดับน้อย (${total} คะแนน)`;
  }

  return {
    verbalScore,
    propertyScore,
    selfScore,
    otherScore,
    totalScore: total,
    riskLevel,
    riskLabel,
    assessedByRole: meta?.assessedByRole,
    assessedByName: meta?.assessedByName,
    assessedDate: meta?.assessedDate,
    notes: meta?.notes,
  };
};

export const getOASRiskBadge = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'HIGH':
      return {
        bg: 'bg-rose-100 text-rose-900 border-rose-300',
        badge: 'bg-rose-600 text-white',
        text: 'text-rose-700',
        label: 'รุนแรงมาก',
        lightBg: 'bg-rose-50',
        recommendation: '⚠️ เสี่ยงเกิดความรุนแรงสูงมาก ต้องปฏิบัติตามแผนเผชิญเหตุความรุนแรง ควบคุมความปลอดภัย ปรึกษาจิตแพทย์ และส่งต่อด่วนไปยังโรงพยาบาลเชียงกลางทันที',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        badge: 'bg-amber-500 text-white',
        text: 'text-amber-700',
        label: 'ปานกลาง',
        lightBg: 'bg-amber-50',
        recommendation: 'แยกผู้ป่วย จัดให้อยู่ในสิ่งแวดล้อมที่สงบ ปลอดภัย จำกัดสิ่งแวดล้อม และเฝ้าระวังความปลอดภัยอย่างใกล้ชิด',
      };
    case 'LOW':
      return {
        bg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
        badge: 'bg-yellow-500 text-white',
        text: 'text-yellow-700',
        label: 'น้อย',
        lightBg: 'bg-yellow-50',
        recommendation: 'เฝ้าระวัง พูดคุยรับฟังด้วยความเข้าใจ หาสาเหตุความคับข้องใจ และลดสิ่งเร้า/สิ่งกระตุ้น',
      };
    case 'NONE':
    default:
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-700',
        label: 'ปกติ',
        lightBg: 'bg-emerald-50',
        recommendation: 'สภาวะอารมณ์และพฤติกรรมสงบปกติ ส่งเสริมสุขภาพจิตและสัมพันธภาพที่ดีในครอบครัว',
      };
  }
};

