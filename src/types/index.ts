export type UserRole = 'ADMIN' | 'HEALTH_OFFICER' | 'VHV'; // VHV = อสม. (Village Health Volunteer)

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  roleLabel: string; // ผู้ดูแลระบบ (สสอ.), เจ้าหน้าที่ รพ.สต. (พี่เลี้ยง), อสม. ประจำหมู่บ้าน
  tambon: string; // ตำบล (e.g. "เชียงกลาง", "เปือ", "ทั้งหมด" for admin)
  village: string; // หมู่บ้าน (e.g. "หมู่ 3 บ้านหนองแดง", "ทั้งหมด")
  hospital: string; // รพ.สต. พี่เลี้ยง (e.g. "รพ.สต.เปือ", "สสอ.เชียงกลาง")
  phone: string;
  avatarUrl?: string;
  createdAt: string;
}

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface TwoQPlusAnswers {
  q1Depressed: boolean; // รู้สึกหดหู่ เศร้า ท้อแท้
  q2Anhedonia: boolean; // เบื่อ ทำอะไรไม่เพลิดเพลิน
  qPlusSelfHarm: boolean; // คิดอยากทำร้ายตัวเอง/ตายไปจะดีกว่า
  hasDepressionRisk: boolean; // true if any answer is true
}

export interface EightQAnswers {
  q1WishDead: number; // 0 or 1
  q2SelfHarmWant: number; // 0 or 2
  q3SuicideThought: number; // 0 or 6
  q4SuicidePlan: number; // 0 or 8
  q5SuicidePrepare: number; // 0 or 9
  q6SelfHarmAttemptNonFatal: number; // 0 or 4
  q7SuicideAttemptFatal: number; // 0 or 10
  q8LifetimeAttempt: number; // 0 or 4
  totalScore: number;
  riskLevel: RiskLevel;
  riskLabel: string;
}

export interface PatientScreening {
  id: string;
  screeningDate: string;
  // Patient basic info
  fullName: string;
  idCard: string; // 13 digits or mask
  age: number;
  gender: 'ชาย' | 'หญิง' | 'อื่นๆ';
  addressNo: string;
  villageNo: string; // หมู่ที่
  villageName: string; // ชื่อหมู่บ้าน
  tambon: string; // ตำบล
  district: string; // "เชียงกลาง"
  province: string; // "น่าน"
  phone: string;
  chronicDiseases: string[]; // โรคประจำตัว / ปัจจัยเสี่ยง
  otherChronicDisease?: string;

  // Caregiver info
  caregiverName: string;
  caregiverRelation: string;
  caregiverPhone: string;

  // 2Q Plus assessment
  twoQ: TwoQPlusAnswers;

  // 8Q assessment (if triggered)
  eightQTriggered: boolean;
  eightQ?: EightQAnswers;

  // Responsible health unit & surveyor
  mentorHospital: string; // รพ.สต. พี่เลี้ยง
  surveyorName: string;
  surveyorRole: string;
  surveyorPhone?: string;
  surveyorUserId: string;

  // Follow-up status
  followUpStatus: 'ปกติไม่ต้องติดตาม' | 'ติดตามเฝ้าระวัง' | 'ส่งต่อ รพ.สต.' | 'ส่งต่อด่วน รพ.เชียงกลาง';
  notes?: string;
  updatedAt: string;
}

export interface TambonInfo {
  name: string;
  hospitals: string[];
  villages: string[];
}
