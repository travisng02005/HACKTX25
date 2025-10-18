import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Questionnaire from './Questionnaire'
import Matchmaker from './Matchmaker'
import PaymentResults from './PaymentResults'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/payment-results" element={<PaymentResults />} />
          <Route path="/matchmaker" element={<Matchmaker />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
