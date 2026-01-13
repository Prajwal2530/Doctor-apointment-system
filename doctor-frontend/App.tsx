import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Role } from './types';
import Header from './components/common/Header';
import Spinner from './components/common/Spinner';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLoginPage, setShowLoginPage] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  // If user is logged in, route based on role
  if (user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          {user.role === Role.Patient && <PatientDashboard />}
          {user.role === Role.Doctor && <DoctorDashboard />}
          {user.role === Role.Admin && <AdminDashboard />}
        </main>
      </div>
    );
  }

  // If not logged in and user requested Login Page
  if (showLoginPage) {
    return <LoginPage onBack={() => setShowLoginPage(false)} />;
  }

  // Default: Guest View (Public Home)
  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLoginClick={() => setShowLoginPage(true)} />
      <main>
        <PatientDashboard onLoginRequired={() => setShowLoginPage(true)} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;