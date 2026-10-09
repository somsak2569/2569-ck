import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { PatientScreening, User } from '../types';

const USERS_COLLECTION = 'users';
const PATIENTS_COLLECTION = 'patients';

/**
 * Fetch all users from Firestore (only when authenticated)
 */
export async function fetchUsersFromFirestore(): Promise<User[]> {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    return snap.docs.map((d) => d.data() as User);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, USERS_COLLECTION);
  }
}

/**
 * Save / Update a user in Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  if (!auth.currentUser) {
    console.info('Not signed in to Firebase; user saved to local storage.');
    return;
  }
  const path = `${USERS_COLLECTION}/${user.id}`;
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete a user from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  if (!auth.currentUser) {
    console.info('Not signed in to Firebase; user deletion performed locally.');
    return;
  }
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Fetch all patient screenings from Firestore (only when authenticated)
 */
export async function fetchPatientsFromFirestore(): Promise<PatientScreening[]> {
  if (!auth.currentUser) {
    return [];
  }
  try {
    const snap = await getDocs(collection(db, PATIENTS_COLLECTION));
    return snap.docs.map((d) => d.data() as PatientScreening);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, PATIENTS_COLLECTION);
  }
}

/**
 * Save or update a patient screening record in Firestore
 */
export async function savePatientToFirestore(patient: PatientScreening): Promise<void> {
  if (!auth.currentUser) {
    console.info('Not signed in to Firebase; patient screening saved to local storage.');
    return;
  }
  const path = `${PATIENTS_COLLECTION}/${patient.id}`;
  try {
    await setDoc(doc(db, PATIENTS_COLLECTION, patient.id), patient, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete a patient screening record from Firestore
 */
export async function deletePatientFromFirestore(patientId: string): Promise<void> {
  if (!auth.currentUser) {
    console.info('Not signed in to Firebase; deletion performed locally.');
    return;
  }
  const path = `${PATIENTS_COLLECTION}/${patientId}`;
  try {
    await deleteDoc(doc(db, PATIENTS_COLLECTION, patientId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Listen for real-time changes to patients (only when authenticated)
 */
export function subscribeToPatients(
  onUpdate: (patients: PatientScreening[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }
  return onSnapshot(
    collection(db, PATIENTS_COLLECTION),
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data() as PatientScreening);
      onUpdate(list);
    },
    (err) => {
      console.warn('Patients snapshot listener notice:', err);
      if (onError) onError(err);
      if (auth.currentUser) {
        handleFirestoreError(err, OperationType.LIST, PATIENTS_COLLECTION);
      }
    }
  );
}

/**
 * Seed initial mock data into Firestore if collection is empty
 */
export async function seedInitialDataIfEmpty(initialUsers: User[], initialPatients: PatientScreening[]): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  try {
    const userSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (userSnap.empty && initialUsers.length > 0) {
      for (const u of initialUsers) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }
    }

    const patientSnap = await getDocs(collection(db, PATIENTS_COLLECTION));
    if (patientSnap.empty && initialPatients.length > 0) {
      for (const p of initialPatients) {
        await setDoc(doc(db, PATIENTS_COLLECTION, p.id), p);
      }
    }
  } catch (e) {
    console.warn('Initial seeding notice:', e);
  }
}
