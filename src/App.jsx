import './App.css'
import {Route, Routes} from 'react-router-dom';
import MapView from './components/MapView.jsx';

function App() {
  return (
      <div className="flex flex-col min-h-screen w-full">
          <main className="flex-1 max-w-4xl mx-auto p-4">
              <Routes>
                  <Route path="/" element={<MapView/>}></Route>
              </Routes>
          </main>
      </div>
  )
}

export default App
