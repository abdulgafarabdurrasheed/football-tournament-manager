import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header";
import { useEffect, lazy, Suspense } from "react";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ProfileView from "@/pages/ProfileView";
import { useAuthStore } from "./stores/authStores";
import { ProtectedRoute } from "./components/auth";
import { AuthCallback } from "@/pages/AuthCallback";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react"; 

const TournamentList = lazy(() => import('@/pages/TournamentList'));
const TournamentWizard = lazy(() => import('@/pages/TournamentWizard'));
const TournamentView = lazy(() => import('@/pages/TournamentView'));

export default function App() {
  const { initialize, isLoading } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 mt-4">Loading..........</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-200">
          <Header />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileView />
                </ProtectedRoute>
              }
            />

            <Route 
              path="/tournaments" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TournamentList />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tournament/new" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TournamentWizard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tournament/:id" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TournamentView />
                  </Suspense>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
    </div>
  );
}