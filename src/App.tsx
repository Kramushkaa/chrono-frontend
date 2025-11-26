import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from 'shared/context/AuthContext'
import { BackendInfo } from 'features/backend-switch/components/BackendInfo'
import { ErrorBoundary } from 'shared/components/ErrorBoundary'
import './App.css'
import { ToastProvider } from 'shared/context/ToastContext'
import { Toasts } from 'shared/ui/Toasts'
import { LoadingStates } from 'shared/ui/LoadingStates'
import { useUnauthorizedToast } from 'shared/hooks/useUnauthorizedToast'
import { useOffline } from 'shared/hooks/useOffline'
import { featureFlags } from 'shared/config/features'

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
const PublicListsPage = React.lazy(() => import('./pages/PublicListsPage'))
const PublicListDetailPage = React.lazy(() => import('./pages/PublicListDetailPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

function AppContent() {
  useUnauthorizedToast()
  useOffline() // Отслеживаем offline режим
  const publicListsEnabled = featureFlags.publicLists
  
  return (
    <React.Suspense fallback={<LoadingStates size="large" message="Загрузка приложения..." />}>
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
          {publicListsEnabled && (
            <>
              <Route path="/lists/public" element={<PublicListsPage />} />
              <Route path="/lists/public/:slug" element={<PublicListDetailPage />} />
            </>
          )}
          <Route path="/lists" element={<ManagePage />} />
          <Route path="/manage" element={<Navigate to="/lists" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
      {featureFlags.backendInfo && <BackendInfo />}
      <Toasts />
    </React.Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}


