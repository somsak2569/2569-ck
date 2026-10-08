import React, { useState } from 'react';
import { User, PatientScreening } from './types';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getStoredUsers, 
  saveUsers, 
  getStoredPatients, 
  savePatients, 
  getAccessiblePatients 
} from './utils/storage';
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

  const handleSelectUser = (user: User) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    showToast(`เข้าสู่ระบบในชื่อ: ${user.fullName} (${user.roleLabel})`, 'info');
  };

  const handleRegisterUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsersState(updatedUsers);
    saveUsers(updatedUsers);
    showToast(`ลงทะเบียนผู้ใช้ ${newUser.fullName} เรียบร้อยแล้ว`, 'success');
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    setCurrentUser(null);
    setIsLoginModalOpen(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // If user is not logged in, show AuthScreen (Login / Register / Demo) as the entry page
  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        onLoginSuccess={handleSelectUser}
        onRegisterUser={handleRegisterUser}
      />
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
      showToast(`บันทึกการแก้ไขข้อมูลของ ${savedPatient.fullName} เรียบร้อยแล้ว`, 'success');
    } else {
      updated = [savedPatient, ...patients];
      showToast(`บันทึกผลการคัดกรอง ${savedPatient.fullName} เรียบร้อยแล้ว`, 'success');
    }

    setPatientsState(updated);
    savePatients(updated);
    setEditingPatient(null);
    setActiveTab('patient_list');
  };

  const handleDeletePatient = (patientId: string) => {
    const target = patients.find((p) => p.id === patientId);
    const updated = patients.filter((p) => p.id !== patientId);
    setPatientsState(updated);
    savePatients(updated);
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenEmergencyGuide={() => setIsEmergencyGuideOpen(true)}
        highRiskCount={highRiskCount}
      />

      {/* Desktop Secondary Navigation Bar */}
      <div className="hidden md:block bg-white border-b border-slate-200 sticky top-14 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>แดชบอร์ดสรุปภาพรวม</span>
            </button>

            <button
              onClick={handleStartScreening}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'new_screening'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>บันทึกแบบคัดกรอง (2Q+ & 8Q)</span>
            </button>

            <button
              onClick={() => setActiveTab('patient_list')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 relative ${
                activeTab === 'patient_list'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ทะเบียนคนไข้ ({accessiblePatients.length})</span>
              {highRiskCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                  {highRiskCount} เสี่ยงสูง
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>
                {currentUser.role === 'ADMIN' ? 'จัดการสมาชิก สสอ./รพ.สต./อสม.' : 'ข้อมูลสังกัดและสมาชิก'}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>สังกัด: <strong>{currentUser.hospital}</strong></span>
          </div>
        </div>
      </div>

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
