import Card from "./components/ui/Card";
import Header from "./components/layout/Header";
import Button from "./components/ui/Button";
import { useState } from 'react';
import { Trophy, Users, Calendar, BarChart3, type LucideIcon } from "lucide-react";

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

interface StatItem {
	label: string;
	value: string;
	icon: LucideIcon;
	color: string;
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
		<div className="min-h-screen bg-slate-950 text-slate-200">
			<Header user={user}
				onLogin={handleLogin}
				onLogout={handleLogout}
			/>
			<main className="max-w-7x1 mx-auto p-4 md:p-8">
				{user ? (
					<div className="space-y-8">
						<div>
							<h2 className="text-3xl font-black text-white">Welcome, {user.name.split(' ')[0]}!</h2>
							<p className="text-slate-400 mt-1">Ready to Manage your Tournaments?</p>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{([
                { label: 'Tournaments', value: '3', icon: Trophy, color: 'yellow' },
                { label: 'Matches Played', value: '24', icon: Calendar, color: 'blue' },
                { label: 'Win Rate', value: '67%', icon: BarChart3, color: 'green' },
                { label: 'Friends', value: '12', icon: Users, color: 'purple' },
              ] as StatItem[]).map((stat) => (
                <Card key={stat.label} className="text-center">
                  <stat.icon className={`mx-auto mb-2 text-${stat.color}-500`} size={24} />
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </Card>
              ))}
            </div>
            
            <Card title="Coming Soon...." className="text-center">
              <p className="text-slate-400">Dashboard features coming in Phase 2...</p>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16 md:py-24">
            <div className="bg-slate-900 p-6 rounded-full inline-block mb-6 shadow-2xl shadow-yellow-500/10">
              <Trophy size={64} className="text-yellow-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Football Tournament Manager</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg mb-8">
              The ultimate tournament tracker for your local leagues. Create tournaments, track stats, and settle debates.
            </p>
            <Button onClick={handleLogin} className="text-lg px-8 py-3">
              Get Started
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;