import { useState } from 'react';
import Button from '../ui/Button';

interface Team {
  id: number;
  name: string;
  points: number;
}

function TeamList() {
    const [teams, setTeams] = useState<Team[]>([
        { id: 1, name: 'Manchester United', points: 45 },
        { id: 2, name: 'Real Madrid', points: 42 },
        { id: 3, name: 'Bayern Munchen', points: 40 },
    ]);
    const [newTeam, setNewTeam] = useState<string>('');
    
    const addTeam = (): void => {
        if (!newTeam.trim()) return;
        setTeams([...teams, { id: Date.now(), name: newTeam.trim(), points: 0 }]);
        setNewTeam('');
    };
    
    const removeTeam = (id: number): void => {
        setTeams(teams.filter(team => team.id !== id));
    };
    
    const addPoints = (id: number, amount: number): void => {
        setTeams(teams.map(team => team.id === id ? { ...team, points: team.points + amount } : team));
    };
    
    const sortedTeams: Team[] = [...teams].sort((a, b) => b.points - a.points);
    return(
        <div className='space-y-4'>
            <div className='flex gap-2'>
                <input
                    type="text"
                    value={newTeam}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam(e.target.value)}
                    placeholder="Add a new team"
                    className="flex-1 bg-slate-800 border border-slate-700 p-2 rounded text-white"
                />
                <Button onClick={addTeam}>Add Team</Button>
            </div>
            {sortedTeams.length === 0 ?(<p className='text-slate-500 text-center py-8'>No teams to show. Add one Above</p>) : (
                <ul className='space-y-2'>{sortedTeams.map((team, index) =>(
            <li 
              key={team.id} 
              className="bg-slate-800 p-4 rounded flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono w-6">{index + 1}.</span>
                <span className="text-white font-bold">{team.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold w-12 text-right">{team.points} pts</span>
                <button 
                  onClick={() => addPoints(team.id, 3)}
                  className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm hover:bg-green-500/30"
                >
                  +3
                </button>
                <button 
                  onClick={() => removeTeam(team.id)}
                  className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeamList;