import { useState } from "react";

function ColorChanger() {
	const [color, setColor] = useState<string>("");

	return (
		<div className="text-center space-y-4">
			<p
				className="text-4xl text-slate-300 mb-4 font-bold p-8 rounded-lg"
				style={{ backgroundColor: color }}
			>
				Current color: {color || "none"}
			</p>

			<div className="flex gap-2 justify-center">
				<button
					onClick={() => setColor("red")}
					className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg text-white font-bold transition-colors"
				>
					Red
				</button>

				<button
					onClick={() => setColor("blue")}
					className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg text-white font-bold transition-colors"
				>
					Blue
				</button>

				<button
					onClick={() => setColor("green")}
					className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-white font-bold transition-colors"
				>
					Green
				</button>
			</div>
		</div>
	);
}

export default ColorChanger;
