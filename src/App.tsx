import Card from "./components/ui/Card";
import ColorChanger from "./components/practice/ChangeColor";
import SimpleForm from "./components/practice/SimpleForm";
import TeamList from "./components/practice/TeamList";
import Header from "./components/layout/Header"

function App() {
	return (
		<div className="p-8 space-y-4">
			<Header />
			<Card title="Manager Cards">Manager Info</Card>
			<Card hoverable onClick={() => alert("Clicked!")}>
				Clickable card
			</Card>
			<ColorChanger />
			<SimpleForm />
            <TeamList />
		</div>
	);
}

export default App;
