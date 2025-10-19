import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import VehicleInfo from './VehicleInfo'
import FinancialInfo from './FinancialInfo'
import PersonalInfo from './PersonalInfo'
import PaymentResults from './PaymentResults'
import Matchmaker from './Matchmaker'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Multi-Step Flow */}
          <Route path="/vehicle-info" element={<VehicleInfo />} />
          <Route path="/financial-info" element={<FinancialInfo />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/payment-results" element={<PaymentResults />} />

          {/* Optional Branch */}
          <Route path="/matchmaker" element={<Matchmaker />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
