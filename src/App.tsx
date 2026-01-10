import Card from './components/ui/Card';

function App(){
    return (
        <div className="p-8 space-y-4">
            <Card title="Manager Cards">Manager Info</Card>
            <Card hoverable onClick={() => alert('Clicked!')}>Clickable card</Card>
        </div>
    )
}


export default App