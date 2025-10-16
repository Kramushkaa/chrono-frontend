import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
// import { ProtectedRoute } from '@shared/ui/ProtectedRoute'
import { AuthProvider } from 'shared/context/AuthContext'
import { BackendInfo } from 'shared/ui/BackendInfo'
import { ErrorBoundary } from 'shared/components/ErrorBoundary'
import './App.css'
import { ToastProvider } from 'shared/context/ToastContext'
import { Toasts } from 'shared/ui/Toasts'

// Lazy-loaded chunks
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const MenuPage = React.lazy(() => import('./pages/MenuPage'))
const ProfilePage = React.lazy(() => import('features/auth/pages/ProfilePage'))
const RegisterPage = React.lazy(() => import('features/auth/pages/RegisterPage'))
const ManagePage = React.lazy(() => import('features/manage/pages/ManagePage'))
const QuizPage = React.lazy(() => import('features/quiz/pages/QuizPage').then(m => ({ default: m.default })))
const LeaderboardPage = React.lazy(() => import('features/quiz/pages/LeaderboardPage'))
const SharedQuizPage = React.lazy(() => import('features/quiz/pages/SharedQuizPage'))
const QuizHistoryPage = React.lazy(() => import('features/quiz/pages/QuizHistoryPage').then(m => ({ default: m.QuizHistoryPage })))
const QuizAttemptDetailPage = React.lazy(() => import('features/quiz/pages/QuizAttemptDetailPage').then(m => ({ default: m.QuizAttemptDetailPage })))
const QuizSessionDetailPage = React.lazy(() => import('features/quiz/pages/QuizSessionDetailPage').then(m => ({ default: m.QuizSessionDetailPage })))
const TimelinePage = React.lazy(() => import('features/timeline/pages/TimelinePage').then(m => ({ default: m.default })))

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <React.Suspense fallback={<div className="loading-overlay" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span>Загрузка...</span></div>}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/timeline" replace />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/quiz/leaderboard" element={<LeaderboardPage />} />
                <Route path="/quiz/history" element={<QuizHistoryPage />} />
                <Route path="/quiz/history/attempt/:attemptId" element={<QuizAttemptDetailPage />} />
                <Route path="/quiz/history/:sessionToken" element={<QuizSessionDetailPage />} />
                <Route path="/quiz/:shareCode" element={<SharedQuizPage />} />
                <Route path="/lists" element={<ManagePage />} />
                <Route path="/manage" element={<Navigate to="/lists" replace />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
            <BackendInfo />
            <Toasts />
          </React.Suspense>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}