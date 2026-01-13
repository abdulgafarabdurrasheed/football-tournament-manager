import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from "./components/layout/Header";
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import TodoPage from "./exercises/Todo";

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

function App() {
	const [user, setUser] = useState<User | null>(null);

	const handleLogin = (): void => {
		setUser({
			id: '123',
			name: 'Flavortown',
			email: 'flavortown@example.com',
		});
	};
	
	const handleLogout = (): void => {
		setUser(null);
	};

	return(
		<BrowserRouter>
			<div className="min-h-screen bg-slate-950 text-slate-200">
				<Header 
					user={user}
					onLogin={handleLogin}
					onLogout={handleLogout}
				/>
				<main className="max-w-7xl mx-auto p-4 md:p-8">
					<Routes>
						<Route 
							path="/" 
							element={
								user ? (
									<Navigate to="/dashboard" replace />
								) : (
									<LandingPage onLogin={handleLogin} />
								)
							} 
						/>
						<Route 
							path="/dashboard" 
							element={
								user ? (
									<Dashboard user={user} />
								) : (
									<Navigate to="/" replace />
								)
							} 
						/>
						<Route path="/tournament/:id" element={<div className="text-center py-16 text-slate-400">Tournament View (Coming Phase 4)</div>} />
						<Route path="*" element={<NotFound />} />
						<Route path="/todo" element={<TodoPage />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	);
}

export default App;