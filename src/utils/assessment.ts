import { EightQAnswers, RiskLevel, TwoQPlusAnswers } from '../types';

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
