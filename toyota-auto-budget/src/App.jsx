import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import SecondPage from './SecondPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/second-page" element={<SecondPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
