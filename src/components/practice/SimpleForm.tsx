import { useState } from "react";
import Button from "../ui/Button";

interface FormData {
	name: string;
	email: string;
	team: string;
}

function SimpleForm() {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		team: "",
	});
	const [submitted, setSubmitted] = useState<boolean>(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Submitted:", formData);
		setSubmitted(true);
	};
	if (submitted) {
		return (
			<div className="text-center text-green-500">
				<p className="text-2xl mb-4">✓ Welcome, {formData.name}!</p>
				<p className="text-slate-400">Team: {formData.team}</p>
				<Button
					onClick={() => setSubmitted(false)}
					variant="secondary"
					className="mt-4"
				>
					Reset
				</Button>
			</div>
		);
	}
	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
			<input
				type="text"
				name="name"
				value={formData.name}
				onChange={handleChange}
				placeholder="Your name"
				className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none"
				required
			/>
			<input
				type="email"
				name="email"
				value={formData.email}
				onChange={handleChange}
				placeholder="Your email"
				className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none"
				required
			/>
			<select
				name="team"
				value={formData.team}
				onChange={handleChange}
				className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-yellow-500 outline-none"
				required
			>
				<option value="">Select your team...</option>
				<option value="Arsenal">Arsenal</option>
				<option value="Chelsea">Chelsea</option>
				<option value="Liverpool">Liverpool</option>
				<option value="Man City">Man City</option>
			</select>
			<Button type="submit">Submit</Button>
		</form>
	);
}

export default SimpleForm;
