import React, { useState, useEffect } from 'react';
import { User, PatientScreening } from './types';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getStoredUsers, 
  saveUsers, 
  getStoredPatients, 
  savePatients, 
  getAccessiblePatients,
  isUserSomsak
} from './utils/storage';
import { testConnection, auth, logOutFirebase } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  fetchUsersFromFirestore, 
  fetchPatientsFromFirestore, 
  saveUserToFirestore, 
  deleteUserFromFirestore,
  savePatientToFirestore, 
  deletePatientFromFirestore,
  subscribeToPatients,
  seedInitialDataIfEmpty,
  purgeSomsakAdminFromFirestore
} from './services/firestoreSync';
import { Navbar } from './components/Navbar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ScreeningForm } from './components/ScreeningForm';
import { PatientList } from './components/PatientList';
import { PatientDetailModal } from './components/PatientDetailModal';
import { LoginModal } from './components/LoginModal';
import { AuthScreen } from './components/AuthScreen';
import { UserManagementView } from './components/UserManagementView';
import { EmergencyGuideModal } from './components/EmergencyGuideModal';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/PWAInstallButton';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  LogOut
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsersState] = useState<User[]>(() => getStoredUsers());
  const [patients, setPatientsState] = useState<PatientScreening[]>(() => getStoredPatients());

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingPatient, setEditingPatient] = useState<PatientScreening | null>(null);
  const [viewingPatient, setViewingPatient] = useState<PatientScreening | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEmergencyGuideOpen, setIsEmergencyGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Firebase connection & data sync on mount
  useEffect(() => {
    // 1. Connection test to Firestore
    testConnection().then((connected) => {
      if (connected) {
        console.log('Firebase Cloud Database (2569-ck) connected successfully');
      }
    });

    let unsubscribeSnapshot: (() => void) | undefined;

    // 2. Auth state listener: only sync when auth is ready and authenticated
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user authenticated:', firebaseUser.email || firebaseUser.uid);

        // Auto-match user profile if not yet selected
        setCurrentUserState((prev) => {
          if (prev && !isUserSomsak(prev)) return prev;
          const email = firebaseUser.email?.toLowerCase() || '';
          const isAdminEmail = email === 'thaipasit5@gmail.com';
          const cleanUsers = users.filter((u) => !isUserSomsak(u));
          const matched = cleanUsers.find(
            (u) =>
              (u.email && u.email.toLowerCase() === email) ||
              u.id === firebaseUser.uid ||
              (isAdminEmail && u.role === 'ADMIN')
          );
          if (matched) {
            setCurrentUser(matched);
            return matched;
          }
          return null;
        });

        // Sync data with Firestore & purge target admin
        try {
          await purgeSomsakAdminFromFirestore();
          const cloudUsers = await fetchUsersFromFirestore();
          if (cloudUsers && cloudUsers.length > 0) {
            const cleanCloudUsers = cloudUsers.filter((u) => !isUserSomsak(u));
            setUsersState(cleanCloudUsers);
            saveUsers(cleanCloudUsers);
          } else {
            const cleanUsers = users.filter((u) => !isUserSomsak(u));
            await seedInitialDataIfEmpty(cleanUsers, patients);
          }

          const cloudPatients = await fetchPatientsFromFirestore();
          if (cloudPatients && cloudPatients.length > 0) {
            setPatientsState(cloudPatients);
            savePatients(cloudPatients);
          }
        } catch (e) {
          console.warn('Firestore sync notice:', e);
        }

        // Attach realtime listener for patients
        try {
          if (unsubscribeSnapshot) unsubscribeSnapshot();
          unsubscribeSnapshot = subscribeToPatients((cloudList) => {
            if (cloudList && cloudList.length > 0) {
              setPatientsState(cloudList);
              savePatients(cloudList);
            }
          });
        } catch (err) {
          console.warn('Realtime subscription notice:', err);
        }
      } else {
        // Not authenticated in Firebase - clean up listener
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = undefined;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const handleSelectUser = (user: User) => {
    if (isUserSomsak(user)) {
      showToast('ไม่พบบัญชีผู้ใช้นี้ในระบบ', 'error');
      return;
    }
    setCurrentUserState(user);
    setCurrentUser(user);
    showToast(`เข้าสู่ระบบในชื่อ: ${user.fullName} (${user.roleLabel})`, 'info');
  };

  const handleRegisterUser = (newUser: User) => {
    const cleanCurrent = users.filter((u) => !isUserSomsak(u));
    const updatedUsers = [...cleanCurrent, newUser];
    setUsersState(updatedUsers);
    saveUsers(updatedUsers);
    saveUserToFirestore(newUser).catch((e) => console.warn('User saved locally, cloud sync pending:', e));
    showToast(`ลงทะเบียนผู้ใช้ ${newUser.fullName} เรียบร้อยแล้ว (ซิงค์ Firebase 2569-ck)`, 'success');
  };

  const handleUpdateUser = (updatedUser: User) => {
    if (isUserSomsak(updatedUser)) {
      handleDeleteUser(updatedUser.id);
      return;
    }
    const updatedUsers = users.filter((u) => !isUserSomsak(u)).map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsersState(updatedUsers);
    saveUsers(updatedUsers);
    saveUserToFirestore(updatedUser).catch((e) => console.warn('User updated locally, cloud sync pending:', e));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUserState(updatedUser);
      setCurrentUser(updatedUser);
    }
    showToast(`อัปเดตข้อมูลของ ${updatedUser.fullName} (${updatedUser.roleLabel}) สำเร็จ`, 'success');
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsersState(updatedUsers);
    saveUsers(updatedUsers);
    deleteUserFromFirestore(userId).catch((e) => console.warn('User deleted locally, cloud sync pending:', e));
    showToast(`ลบข้อมูล ${userToDelete ? userToDelete.fullName : 'ผู้ใช้งาน'} เรียบร้อยแล้ว`, 'info');
  };

  const handleLogout = () => {
    logOutFirebase().catch((e) => console.warn('Firebase logout notice:', e));
    setCurrentUserState(null);
    setCurrentUser(null);
    setIsLoginModalOpen(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // If user is not logged in, show AuthScreen (Login / Register / Demo) as the entry page
  if (!currentUser) {
    return (
      <>
        <OfflineIndicator />
        <AuthScreen
          users={users}
          onLoginSuccess={handleSelectUser}
          onRegisterUser={handleRegisterUser}
        />
      </>
    );
  }

  // Patients that the current user has permission to see/access
  const accessiblePatients = getAccessiblePatients(currentUser, patients);

  // Number of high-risk patients
  const highRiskCount = accessiblePatients.filter((p) => p.eightQ?.riskLevel === 'HIGH').length;

  const handleSavePatient = (savedPatient: PatientScreening) => {
    const existingIndex = patients.findIndex((p) => p.id === savedPatient.id);
    let updated: PatientScreening[];

    if (existingIndex >= 0) {
      updated = [...patients];
      updated[existingIndex] = savedPatient;
      showToast(`บันทึกการแก้ไขข้อมูลของ ${savedPatient.fullName} เรียบร้อยแล้ว (ซิงค์ Firebase 2569-ck)`, 'success');
    } else {
      updated = [savedPatient, ...patients];
      showToast(`บันทึกผลการคัดกรอง ${savedPatient.fullName} เรียบร้อยแล้ว (ซิงค์ Firebase 2569-ck)`, 'success');
    }

    setPatientsState(updated);
    savePatients(updated);
    savePatientToFirestore(savedPatient).catch((e) => console.warn('Saved locally, Firestore sync pending:', e));
    setEditingPatient(null);
    setActiveTab('patient_list');
  };

  const handleDeletePatient = (patientId: string) => {
    const target = patients.find((p) => p.id === patientId);
    const updated = patients.filter((p) => p.id !== patientId);
    setPatientsState(updated);
    savePatients(updated);
    deletePatientFromFirestore(patientId).catch((e) => console.warn('Deleted locally, Firestore sync pending:', e));
    if (viewingPatient?.id === patientId) {
      setViewingPatient(null);
    }
    showToast(`ลบข้อมูลคนไข้ ${target ? target.fullName : ''} ออกจากระบบแล้ว`, 'info');
  };

  const handleStartScreening = () => {
    setEditingPatient(null);
    setActiveTab('new_screening');
  };

  const handleEditPatient = (patient: PatientScreening) => {
    setEditingPatient(patient);
    setViewingPatient(null);
    setActiveTab('new_screening');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-teal-600 selection:text-white pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <OfflineIndicator />
      {/* Top Navbar with Integrated Responsive Menu Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenEmergencyGuide={() => setIsEmergencyGuideOpen(true)}
        highRiskCount={highRiskCount}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'new_screening') {
            setEditingPatient(null);
          }
          setActiveTab(tab);
        }}
        accessiblePatientCount={accessiblePatients.length}
        onStartNewScreening={handleStartScreening}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 animate-in fade-in slide-in-from-top-3 max-w-sm">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-800 text-white border-rose-700'
                : 'bg-teal-900 text-white border-teal-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span className="flex-1">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            patients={accessiblePatients}
            onStartScreening={handleStartScreening}
            onViewPatient={(p) => setViewingPatient(p)}
            onViewPatientList={() => setActiveTab('patient_list')}
          />
        )}

        {activeTab === 'new_screening' && (
          <ScreeningForm
            currentUser={currentUser}
            editingPatient={editingPatient}
            onSave={handleSavePatient}
            onCancel={() => {
              setEditingPatient(null);
              setActiveTab('patient_list');
            }}
          />
        )}

        {activeTab === 'patient_list' && (
          <PatientList
            currentUser={currentUser}
            patients={accessiblePatients}
            onViewPatient={(p) => setViewingPatient(p)}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            onStartNewScreening={handleStartScreening}
          />
        )}

        {activeTab === 'members' && (
          <UserManagementView
            currentUser={currentUser}
            users={users}
            onOpenRegister={() => setIsLoginModalOpen(true)}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>

      {/* Patient Detail Modal */}
      {viewingPatient && (
        <PatientDetailModal
          patient={viewingPatient}
          currentUser={currentUser}
          onClose={() => setViewingPatient(null)}
          onEdit={handleEditPatient}
        />
      )}

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
      />

      {/* Emergency Guide Modal */}
      <EmergencyGuideModal
        isOpen={isEmergencyGuideOpen}
        onClose={() => setIsEmergencyGuideOpen(false)}
      />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'new_screening') {
            setEditingPatient(null);
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        highRiskCount={highRiskCount}
      />
    </div>
  );
}
