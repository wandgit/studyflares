import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import StudyPage from './pages/StudyPage';
import ExamPage from './pages/ExamPage';
import StudyLibrary from './pages/StudyLibrary';
import UploadPage from './pages/UploadPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthProvider';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './components/common/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-paper text-text">
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/study" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StudyPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/exam" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExamPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/library" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StudyLibrary />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/upload" element={
                <ProtectedRoute>
                  <MainLayout>
                    <UploadPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Redirect unmatched routes */}
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
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
