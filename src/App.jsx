import './App.css'
import {Route, Routes} from 'react-router-dom';
import Home from './components/Home.jsx';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

function App() {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <main>
                <Routes>
                    <Route path="/" element={<Home/>}></Route>
                </Routes>
            </main>
        </QueryClientProvider>
    )
}

export default App
