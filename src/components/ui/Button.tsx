interface ButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "danger" | "ghost";
	disabled?: boolean;
	loading?: boolean;
	type?: "button" | "submit" | "reset";
	className?: string;
}

export function Button({
	children,
	onClick,
	variant = "primary",
	disabled = false,
	loading = false,
	type = "button",
	className = "",
}: ButtonProps) {
	const baseStyles =
		"px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
	const variants = {
		primary: "bg-yellow-500 text-black hover:bg-yellow-400",
		secondary: "bg-slate-700 text-white hover:bg-slate-600",
		danger: "bg-red-500 text-white hover:bg-red-400",
		ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={`${baseStyles} ${variants[variant]} ${className}`}
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
