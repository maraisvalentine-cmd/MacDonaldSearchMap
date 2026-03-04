import './App.css'
import {Route, Routes} from 'react-router-dom';
import MapView from './components/MapView.jsx';

function App() {
  return (
      <div>
          <main>
              <Routes>
                  <Route path="/" element={<MapView/>}></Route>
              </Routes>
          </main>
      </div>
  )
}

export default App
