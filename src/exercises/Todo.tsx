import { useTodoStore } from '../exercises/todoStore';
import Button from '../components/ui/Button';
import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

export default function TodoPage() {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      addTodo(input);
      setInput('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-white">My Todos</h2>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
        />
        <Button onClick={handleAdd}><Plus size={18} /> Add</Button>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="cursor-pointer"
            />
            <span className={todo.completed ? 'line-through text-slate-500' : 'text-white'}>{todo.text}</span>
            <button onClick={() => removeTodo(todo.id)} className="ml-auto text-red-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}