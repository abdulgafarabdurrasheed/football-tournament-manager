import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-9xl font-black text-slate-800 mb-4">404</div>
      <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Looks like this page took a red card and got sent off. 
        Let's get you back in the game.
      </p>
      <div className="flex gap-4">
        <Button 
          variant="secondary" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Go Back
        </Button>
        <Button 
          onClick={() => navigate('/')}
        >
          <Home size={16} className="mr-2" />
          Home
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
