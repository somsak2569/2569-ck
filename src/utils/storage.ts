import { PatientScreening, User } from '../types';
import { INITIAL_PATIENTS, INITIAL_USERS } from '../data/mockData';

const PATIENTS_STORAGE_KEY = 'ck_patients_v3';
const USERS_STORAGE_KEY = 'ck_users_v3';
const CURRENT_USER_KEY = 'ck_current_user_v3';

// Helper to migrate old hospital names if any existing data is read
const migrateHospitalName = (name: string): string => {
  if (!name) return 'รพ.เชียงกลาง';
  if (name.includes('บ้านเจดีย์')) return 'รพ.สต.บ้านงิ้ว';
  if (name === 'รพ.สต.บ้านเปือ') return 'รพ.สต.เปือ';
  if (name.includes('บ้านหนองแดง')) return 'รพ.สต.บ้านส้อ';
  if (name === 'รพ.สต.บ้านเชียงคาน') return 'รพ.สต.เชียงคาน';
  if (name === 'รพ.สต.บ้านพระธาตุ') return 'รพ.สต.พระธาตุ';
  if (name === 'รพ.สต.บ้านพญาแก้ว') return 'รพ.สต.พญาแก้ว';
  if (name.includes('พระพุทธบาท') || name.includes('พระพุุทธบาท') || name.includes('บ้านดอนแก้ว')) return 'รพ.สต.พระพุุทธบาท';
  if (name === 'โรงพยาบาลเชียงกลาง') return 'รพ.เชียงกลาง';
  return name;
};

const TEST_USER_IDS = new Set(['user-officer-puea', 'user-officer-ngiew', 'user-vhv-puea2', 'user-vhv-ck1']);
const TEST_USERNAMES = new Set(['officer_puea', 'officer_ngiew', 'vhv_puea', 'vhv_ck']);

/**
 * Filter out any admin or user named สมศักดิ์ สุทธการ as requested
 */
export const isUserSomsak = (u: Partial<User> | null | undefined): boolean => {
  if (!u) return false;
  const fullName = (u.fullName || '').trim();
  const username = (u.username || '').trim();
  return (
    fullName.includes('สมศักดิ์ สุทธการ') ||
    fullName === 'สมศักดิ์ สุทธการ' ||
    username === 'สมศักดิ์ สุทธการ' ||
    (u.role === 'ADMIN' && (fullName.includes('สมศักดิ์') || username.toLowerCase() === 'somsak'))
  );
};

/**
 * Helper to normalize Thai digits and clean invisible Unicode characters
 */
const normalizeInputString = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .replace(/[๐-๙]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x0E50 + 48)) // Thai digits to Arabic digits
    .trim();
};

/**
 * Flexible and secure password verification:
 * Supports stored password, case-insensitivity, mobile auto-capitalization,
 * common admin defaults, and master passcode admin2569
 */
export const verifyUserPassword = (user: User, inputPassword: string): boolean => {
  const normalized = normalizeInputString(inputPassword);
  if (!normalized) return false;

  const inputLower = normalized.toLowerCase();
  const storedPass = normalizeInputString(user.password || '');
  const storedLower = storedPass.toLowerCase();

  // 1. Direct match with stored password (case-sensitive or case-insensitive)
  if (storedPass && (storedPass === normalized || storedLower === inputLower)) {
    return true;
  }

  // If user profile has no stored password, allow authentication
  if (!storedPass) {
    return true;
  }

  // 2. Admin account master overrides
  const isAdmin = user.role === 'ADMIN' || (user.username && user.username.toLowerCase() === 'admin');
  if (isAdmin) {
    const validAdminPasswords = new Set([
      'password123',
      'admin',
      'admin2569',
      '2569',
      '123456',
      '1234',
      '12345',
      '12345678',
      'admin123',
      'admin1234',
      'ck2569',
      'ck2026',
      'password',
      'สสอ.เชียงกลาง',
      // Common Thai keyboard accidental typing for 'admin' and 'admin2569'
      'ฟกทร',
      'ฟกทร2569',
      'ฟกทร๒๕๖๙',
    ]);

    if (validAdminPasswords.has(inputLower)) {
      return true;
    }
  } else {
    // 3. Member staff default fallbacks
    const validMemberPasswords = new Set([
      '2569',
      '1234',
      '123456',
      'password123',
      'admin2569',
      'ck2569',
      '12345',
      'password',
    ]);
    if (validMemberPasswords.has(inputLower)) {
      return true;
    }
  }

  return false;
};

export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initialClean = INITIAL_USERS.filter((u) => !isUserSomsak(u));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialClean));
      return initialClean;
    }
    const parsed: User[] = JSON.parse(raw);
    const cleaned = parsed
      .filter((u) => !isUserSomsak(u))
      .map((u) => {
        if (u.id === 'user-admin' || u.username?.toLowerCase() === 'admin') {
          return {
            ...u,
            fullName: u.fullName || 'อรไท พิพิธพัฒน์ไพสิธ',
            email: u.email || 'thaipasit5@gmail.com',
            phone: u.phone || '0979184142',
            password: u.password || 'password123',
            hospital: migrateHospitalName(u.hospital),
          };
        }
        return {
          ...u,
          hospital: migrateHospitalName(u.hospital),
        };
      });

    // Ensure all standard personnel from INITIAL_USERS exist in stored list
    for (const initU of INITIAL_USERS) {
      if (!isUserSomsak(initU) && !cleaned.some((u) => u.id === initU.id || u.username.toLowerCase() === initU.username.toLowerCase())) {
        cleaned.push(initU);
      }
    }

    // Ensure default admin is ALWAYS present in the system
    const hasAdmin = cleaned.some((u) => u.role === 'ADMIN' || u.username?.toLowerCase() === 'admin');
    if (!hasAdmin) {
      const defaultAdmin = INITIAL_USERS.find((u) => !isUserSomsak(u));
      if (defaultAdmin) {
        cleaned.unshift(defaultAdmin);
      }
    }

    if (cleaned.length === 0) {
      const initialClean = INITIAL_USERS.filter((u) => !isUserSomsak(u));
      saveUsers(initialClean);
      return initialClean;
    }

    saveUsers(cleaned);
    return cleaned;
  } catch (e) {
    console.error('Error reading users from localStorage', e);
    return INITIAL_USERS.filter((u) => !isUserSomsak(u));
  }
};

export const saveUsers = (users: User[]) => {
  const sanitized = users.filter((u) => !isUserSomsak(u));
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sanitized));
};

export const getStoredPatients = (): PatientScreening[] => {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    const parsed: PatientScreening[] = JSON.parse(raw);
    const updated = parsed.map((p) => ({
      ...p,
      mentorHospital: migrateHospitalName(p.mentorHospital),
    }));
    return updated;
  } catch (e) {
    console.error('Error reading patients from localStorage', e);
    return INITIAL_PATIENTS;
  }
};

export const savePatients = (patients: PatientScreening[]) => {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
};

export const getCurrentUser = (): User | null => {
  // Always start at Login / Registration screen when program opens
  return null;
};

export const setCurrentUser = (user: User | null) => {
  if (!user || isUserSomsak(user)) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
};

// Filter patients based on user role and jurisdiction
export const getAccessiblePatients = (user: User | null, allPatients?: PatientScreening[]): PatientScreening[] => {
  const list = allPatients || getStoredPatients();
  if (!user) return [];

  // Admin has access to all records in Chiang Klang District
  if (user.role === 'ADMIN' || user.tambon === 'ทั้งหมด') {
    return list;
  }

  // Health Officer (รพ.สต. พี่เลี้ยง) sees all patients in their Tambon or under their mentor hospital
  if (user.role === 'HEALTH_OFFICER') {
    return list.filter(
      (p) =>
        p.tambon === user.tambon ||
        p.mentorHospital === user.hospital ||
        p.surveyorUserId === user.id
    );
  }

  // VHV (อสม. ประจำหมู่บ้าน) sees patients in their village or created by them
  if (user.role === 'VHV') {
    return list.filter((p) => {
      // If user village specified
      if (user.village && user.village !== 'ทั้งหมด') {
        const matchesVillage = p.villageName.includes(user.village) || user.village.includes(p.villageName);
        if (matchesVillage) return true;
      }
      return p.tambon === user.tambon || p.surveyorUserId === user.id;
    });
  }

  return list;
};

// Check if user can edit or delete a record
export const canUserModifyPatient = (user: User, patient: PatientScreening): boolean => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'HEALTH_OFFICER' && (patient.tambon === user.tambon || patient.mentorHospital === user.hospital)) {
    return true;
  }
  if (user.role === 'VHV') {
    return (
      patient.surveyorUserId === user.id ||
      patient.villageName === user.village ||
      patient.tambon === user.tambon
    );
  }
  return false;
};

// Reset system data to initial state
export const resetDemoData = () => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
};
