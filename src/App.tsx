import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from "./components/layout/Header";
import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import { useAuthStore } from './stores/authStores';
import { ProtectedRoute } from './components/auth';
import { AuthCallback } from '@/pages/AuthCallback';

export default function App() {
	const { initialize, isLoading } = useAuthStore()
	useEffect(() => {
		initialize()
	}, [initialize])

		if(isLoading) {
			return (
				<div className='min-h-screen bg-slate-950 flex items-center justify-center'>
					<div className="text-center">
						<div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparesnt rounded-full mx-auto" />
						<p className="text-slate-400 mt-4">Loading..........</p>
					</div>
				</div>
			)
		}

		return (
			<BrowserRouter>
				<div className="min-h-screen bg-slate-950 text-slate-200">
					<Header />

					<Routes>
						<Route path='/' element={<LandingPage />} />
						<Route path='/auth/callback' element={<AuthCallback />}	/>

						<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
						<Route path="*" element={<NotFound />} />

					</Routes>
				</div>
			</BrowserRouter>
		)
}