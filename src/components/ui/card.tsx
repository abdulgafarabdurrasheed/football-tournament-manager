interface CardProps {
	title?: string;
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	hoverable?: boolean;
}

function Card({
	title,
	children,
	className = "",
	onClick,
	hoverable = false,
}: CardProps) {
	return (
		<div
			onClick={onClick}
			className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className} ${hoverable ? "cursor-pointer hover:border-slate-700 hover:bg-slate-800/50 transition-all" : ""}`}
		>
			{title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
			{children}
		</div>
	);
}

export default Card;
