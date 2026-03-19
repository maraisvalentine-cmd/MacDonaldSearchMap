import './App.css'
import {Route, Routes} from 'react-router-dom';
import Home from './components/Home.jsx';

function App() {
  return (
      <div>
          <main>
              <Routes>
                  <Route path="/" element={<Home/>}></Route>
              </Routes>
          </main>
      </div>
  )
}

export default App
