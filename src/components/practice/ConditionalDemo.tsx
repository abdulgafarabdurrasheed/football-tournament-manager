import { useState } from 'react';
import Button from '../ui/button';
import Card from '../ui/card';

type Status = 'idle' | 'loading' | 'success' | 'error';

function ConditionalDemo() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>('idle');
  
  const simulateAction = () => {
    setStatus('loading');
    setTimeout(() => {
      setStatus(Math.random() > 0.3 ? 'success' : 'error');
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      
      <Card title="Pattern 1: && Operator">
        <Button onClick={() => setIsLoggedIn(!isLoggedIn)} variant="secondary">
          {isLoggedIn ? 'Log Out' : 'Log In'}
        </Button>
        {isLoggedIn && (
          <p className="text-green-500 mt-3">✓ You are logged in!</p>
        )}
      </Card>
      
      <Card title="Pattern 2: Ternary (? :)">
        <Button onClick={() => setShowDetails(!showDetails)} variant="secondary">
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
        {showDetails ? (
          <div className="mt-3 p-4 bg-slate-800 rounded">
            <p className="text-white">Here are the secret details!</p>
            <p className="text-slate-400 text-sm mt-2">This content only shows when expanded.</p>
          </div>
        ) : (
          <p className="text-slate-500 mt-3">Click to reveal...</p>
        )}
      </Card>
      
      <Card title="Pattern 3: State Machine">
        <div className="space-y-3">
          <Button 
            onClick={simulateAction} 
            loading={status === 'loading'}
            disabled={status === 'loading'}
          >
            {status === 'idle' && 'Start Action'}
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Try Again'}
            {status === 'error' && 'Retry'}
          </Button>
          
          {status === 'success' && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded text-green-400">
              ✓ Action completed successfully!
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400">
              ✕ Something went wrong. Please try again.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ConditionalDemo;