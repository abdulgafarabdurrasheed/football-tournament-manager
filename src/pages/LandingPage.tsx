import { Trophy } from 'lucide-react';
import { LoginButton } from '@/components/auth';

function LandingPage() {
  return (
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
      <LoginButton className="text-lg px-8 py-3">
        Get Started
      </LoginButton>
    </div>
  );
}

export default LandingPage;
