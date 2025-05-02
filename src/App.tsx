import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/common/ThemeProvider.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import { Toaster as HotToaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout.tsx';
import Navbar from './components/layout/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import UploadPage from './pages/UploadPage.tsx';
import StudyPage from './pages/StudyPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ExamPage from './pages/ExamPage.tsx';
import ExamResults from './pages/ExamResults.tsx';
import StudyLibrary from './pages/StudyLibrary.tsx';
import AuthPage from './pages/AuthPage.tsx';
import AuthCallbackPage from './pages/AuthCallbackPage.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import useAuthStore from './store/useAuthStore.ts';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-paper text-text">
          {isAuthenticated && <Navbar />}
          
          <Routes>
            {/* Auth routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }>
              <Route index element={<HomePage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="study" element={<StudyPage />} />
              <Route path="library" element={<StudyLibrary />} />
              <Route path="exam" element={<ExamPage />} />
              <Route path="exam/results" element={<ExamResults />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Redirect unmatched routes */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>

          <HotToaster 
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
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
