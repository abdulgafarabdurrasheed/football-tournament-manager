import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsAuthenticated } from '@/stores/authStores';
import { UserProfile, LoginButton } from '@/components/auth'

export function Header() {
  const isAuthenticated = useIsAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return(
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to='/' className='flex items-center gap-3'>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-2 rounded-lg text-black shadow-lg shadow-orange-500/20">
            <Trophy size={20} strokeWidth={2.5}/>
          </div>
          <h1 className="text-white text-xl font-black tracking-tight hidden sm:block">Football <span className='text-yellow-500'>Tournament Manager</span></h1>
        </Link>

        <div className="hidden sm:block">
          {isAuthenticated ? <UserProfile /> : <LoginButton />}
        </div>

        <button className="sm:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 p-4">
          {isAuthenticated ? <UserProfile /> : <LoginButton className='w-full' />}
        </div>
      )}
    </header>
  )
}

export default Header