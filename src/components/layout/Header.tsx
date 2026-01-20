import { Trophy, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface HeaderProps {
  user: UserData | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

function Header({ user, onLogin, onLogout }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    return (
        <header className='bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40'>
            <div className='max-w-7x1 mx-auto px-4 h-16 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='bg-gradient-to-br from-yellow-400 to-orange-600 p-2 rounded-lg text-black shadow-lg shadow-orange-500/20'>
                        <Trophy size={20} strokeWidth={2.5} />
                    </div>
                    <h1 className='text-xl font-bold text-white tracking-tight hidden sm:block'>Football <span className="text-yellow-500">Tournament Manager</span></h1>
                </div>
                <div className='hidden sm:block'>
                   {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <User size={16} className="text-slate-400" />
                )}
                <span className="text-sm text-white font-medium">{user.name}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Button onClick={() => {navigate('/login')}}>
              Sign In
            </Button>
          )}
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden text-slate-400"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 p-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="text-white">{user.name}</span>
              </div>
              <Button onClick={onLogout} variant="danger" className="w-full">
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={onLogin} className="w-full">
              Sign In
            </Button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;