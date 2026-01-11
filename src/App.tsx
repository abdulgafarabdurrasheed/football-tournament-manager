import Card from './components/ui/card';
import ColorChanger from './components/practice/ChangeColor'

function App(){
    return (
        <div className="p-8 space-y-4">
            <Card title="Manager Cards">Manager Info</Card>
            <Card hoverable onClick={() => alert('Clicked!')}>Clickable card</Card>
            <ColorChanger />
        </div>
    )
}


export default App