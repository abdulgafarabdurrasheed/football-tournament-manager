import { useCounterStore } from './CounterStore'

export function CounterDemo() {
    const { count, increment, decrement, reset } = useCounterStore()
    
    return (
        <div className='p-4 space-y-4'>
            <h1 className='text-2xl font-bold'>Count: {count}</h1>
            <div className='space-x-2'>
                <button onClick={decrement} className='px-4 py-2 bg-red-500 text-white rounded'>-</button>
                <button onClick={increment} className='px-4 py-2 bg-green-500 text-white rounded'>+</button>
                <button onClick={reset} className='px-4 py-2 bg-gray-500 text-white rounded'>Reset</button>
            </div>
        </div>
    )
}