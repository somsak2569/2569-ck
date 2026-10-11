import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PatientScreening, User } from '../types';
import { isUserSomsak } from '../utils/storage';

const USERS_COLLECTION = 'users';
const PATIENTS_COLLECTION = 'patients';

/**
 * Automatically purge any document corresponding to admin สมศักดิ์ สุทธการ from Firestore
 */
export async function purgeSomsakAdminFromFirestore(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    for (const d of snap.docs) {
      const u = d.data() as User;
      if (isUserSomsak(u) || d.id === 'user-somsak') {
        await deleteDoc(doc(db, USERS_COLLECTION, d.id));
        console.info(`Successfully purged user ${u.fullName || d.id} from Firestore`);
      }
    }
  } catch (err) {
    console.warn('purgeSomsakAdminFromFirestore notice:', err);
  }
}

/**
 * Fetch all users from Firestore
 */
export async function fetchUsersFromFirestore(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const cleanUsers: User[] = [];
    for (const d of snap.docs) {
      const u = d.data() as User;
      if (isUserSomsak(u) || d.id === 'user-somsak') {
        deleteDoc(doc(db, USERS_COLLECTION, d.id)).catch((e) =>
          console.warn('Could not delete purged user doc from Firestore:', e)
        );
      } else {
        cleanUsers.push(u);
      }
    }
    return cleanUsers;
  } catch (err) {
    console.error('Error fetching users from Firestore:', err);
    return [];
  }
}

/**
 * Real-time listener for users collection across all devices
 */
export function subscribeToUsers(
  onUpdate: (users: User[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, USERS_COLLECTION),
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => d.data() as User)
        .filter((u) => !isUserSomsak(u));
      onUpdate(list);
    },
    (err) => {
      console.warn('Users snapshot listener notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Update a user in Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  if (isUserSomsak(user)) {
    return;
  }
  const path = `${USERS_COLLECTION}/${user.id}`;
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
    console.info(`User ${user.username} saved to Firestore successfully`);
  } catch (err) {
    console.error(`Failed to save user ${user.username} to Firestore:`, err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete a user from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    console.info(`User ${userId} deleted from Firestore successfully`);
  } catch (err) {
    console.error(`Failed to delete user ${userId} from Firestore:`, err);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Fetch all patient screenings from Firestore
 */
export async function fetchPatientsFromFirestore(): Promise<PatientScreening[]> {
  try {
    const snap = await getDocs(collection(db, PATIENTS_COLLECTION));
    return snap.docs.map((d) => d.data() as PatientScreening);
  } catch (err) {
    console.error('Error fetching patients from Firestore:', err);
    return [];
  }
}

/**
 * Save or update a patient screening record in Firestore
 */
export async function savePatientToFirestore(patient: PatientScreening): Promise<void> {
  const path = `${PATIENTS_COLLECTION}/${patient.id}`;
  try {
    await setDoc(doc(db, PATIENTS_COLLECTION, patient.id), patient, { merge: true });
    console.info(`Patient ${patient.fullName} saved to Firestore successfully`);
  } catch (err) {
    console.error(`Failed to save patient ${patient.fullName} to Firestore:`, err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete a patient screening record from Firestore
 */
export async function deletePatientFromFirestore(patientId: string): Promise<void> {
  const path = `${PATIENTS_COLLECTION}/${patientId}`;
  try {
    await deleteDoc(doc(db, PATIENTS_COLLECTION, patientId));
    console.info(`Patient ${patientId} deleted from Firestore successfully`);
  } catch (err) {
    console.error(`Failed to delete patient ${patientId} from Firestore:`, err);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Listen for real-time changes to patients across all devices
 */
export function subscribeToPatients(
  onUpdate: (patients: PatientScreening[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, PATIENTS_COLLECTION),
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data() as PatientScreening);
      onUpdate(list);
    },
    (err) => {
      console.warn('Patients snapshot listener notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seed initial mock data into Firestore if collection is empty
 */
export async function seedInitialDataIfEmpty(initialUsers: User[], initialPatients: PatientScreening[]): Promise<void> {
  try {
    const userSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (userSnap.empty && initialUsers.length > 0) {
      for (const u of initialUsers) {
        if (!isUserSomsak(u)) {
          await setDoc(doc(db, USERS_COLLECTION, u.id), u);
        }
      }
      console.info('Seeded initial users into Firestore');
    }

    const patientSnap = await getDocs(collection(db, PATIENTS_COLLECTION));
    if (patientSnap.empty && initialPatients.length > 0) {
      for (const p of initialPatients) {
        await setDoc(doc(db, PATIENTS_COLLECTION, p.id), p);
      }
      console.info('Seeded initial patients into Firestore');
    }
  } catch (e) {
    console.warn('Initial seeding notice:', e);
  }
}
