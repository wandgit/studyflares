import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';

import ProfileSetup from './pages/ProfileSetup';
import ProfilePage from './pages/ProfilePage';
import StudyPage from './pages/StudyPage';
import ExamPage from './pages/ExamPage';
import ExamResults from './pages/ExamResults';
import StudyLibrary from './pages/StudyLibrary';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './components/common/ThemeProvider';
import { AuthProvider } from './components/auth/AuthProvider';
import { QueryProvider } from './components/providers/QueryProvider';
// Auth overlay is now handled by AuthTrigger component
import { useAuth } from './components/auth/AuthProvider';
import { RequireAuth } from './components/auth/RequireAuth';

const AppContent = () => {
  useAuth(); // Initialize auth context
  return (
    <div className="min-h-screen bg-paper text-text">
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } />
        


        <Route path="/profile" element={
          <RequireAuth>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/profile/setup" element={
          <MainLayout>
            <ProfileSetup />
          </MainLayout>
        } />

        <Route path="/study" element={
          <MainLayout>
            <StudyPage />
          </MainLayout>
        } />

        <Route path="/exam" element={
          <MainLayout>
            <ExamPage />
          </MainLayout>
        } />

        <Route path="/exam/results" element={
          <MainLayout>
            <ExamResults />
          </MainLayout>
        } />

        <Route path="/library" element={
          <MainLayout>
            <StudyLibrary />
          </MainLayout>
        } />

        <Route path="/upload" element={
          <RequireAuth>
            <MainLayout>
              <UploadPage />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="/dashboard" element={
          <RequireAuth>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster 
        position="top-right"
        toastOptions={{
          error: {
            duration: 5000,
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
            },
          },
          success: {
            duration: 3000,
            style: {
              background: '#ECFDF5',
              color: '#065F46',
            },
          },
        }}
      />

      {/* Auth overlay is now handled by AuthTrigger component */}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <QueryProvider>
            <AppContent />
          </QueryProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
