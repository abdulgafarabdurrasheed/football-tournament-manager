interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-slate-900 border rounded-lg px-4 py-3 text-white 
          placeholder:text-slate-600 outline-none transition-colors
          ${error 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-slate-700 focus:border-yellow-500'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default Input;