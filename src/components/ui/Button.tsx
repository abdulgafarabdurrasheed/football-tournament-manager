interface ButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	loading?: boolean;
	type?: "button" | "submit" | "reset";
	className?: string;
}

export function Button({
	children,
	onClick,
	variant = "primary",
	size = "md",
	disabled = false,
	loading = false,
	type = "button",
	className = "",
}: ButtonProps) {
	const baseStyles =
		"rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
	const variants = {
		primary: "bg-yellow-500 text-black hover:bg-yellow-400",
		secondary: "bg-slate-700 text-white hover:bg-slate-600",
		danger: "bg-red-500 text-white hover:bg-red-400",
		ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
		outline: "border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent",
	};
	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2",
		lg: "px-6 py-3 text-lg",
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
		>
			{loading ? (
				<span className="flex items-center gap-2">
					<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
							fill="none"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					Loading...
				</span>
			) : (
				children
			)}
		</button>
	);
}

export default Button;
