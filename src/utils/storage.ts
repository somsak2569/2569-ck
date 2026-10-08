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

export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(raw);
    const updated = parsed.map((u) => {
      if (u.id === 'user-admin' || u.role === 'ADMIN') {
        return {
          ...u,
          fullName: 'อรไท พิพิธพัฒน์ไพสิธ',
          email: 'thaipasit5@gmail.com',
          phone: '0979184142',
          hospital: migrateHospitalName(u.hospital),
        };
      }
      return {
        ...u,
        hospital: migrateHospitalName(u.hospital),
      };
    });
    return updated;
  } catch (e) {
    console.error('Error reading users from localStorage', e);
    return INITIAL_USERS;
  }
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
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
  if (!user) {
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
