import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import './App.css'

function PlanPreferences() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialData = location.state?.formData || {}

  const [formData, setFormData] = useState({
    ...initialData,
    planType: initialData.planType || 'loan',
    termLength: initialData.termLength || '60',
    annualMileage: initialData.annualMileage || '12000',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    navigate('/payment-results', { state: { formData } })
  }

  return (
    <div className="container">
      <h1>Plan Preferences</h1>
      <p>Choose your payment and term options</p>

      <div className="adjustment-controls">
        <div className="edit-form">
          {/* PLAN TYPE TOGGLE */}
          <div className="edit-group">
            <h4>Plan Type</h4>
            <div className="input-row">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="planType"
                  value="loan"
                  checked={formData.planType === 'loan'}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">Loan (Financing)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="planType"
                  value="lease"
                  checked={formData.planType === 'lease'}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">Lease</span>
              </label>
            </div>
            <small>
              {formData.planType === 'loan'
                ? 'Own the vehicle after all payments are made.'
                : 'Lower monthly cost but mileage limits apply.'}
            </small>
          </div>

          {/* TERM LENGTH SLIDER */}
          <div className="edit-group">
            <h4>Term Length</h4>
            <div className="input-group">
              <label>Term: {formData.termLength} months</label>
              <div className="slider-container">
                <span className="slider-label">24</span>
                <input
                  type="range"
                  name="termLength"
                  value={formData.termLength}
                  onChange={handleInputChange}
                  min="24"
                  max="72"
                  step="12"
                  className="form-slider"
                />
                <span className="slider-label">72</span>
              </div>
              <small>Shorter terms = higher payments but less total interest</small>
            </div>
          </div>

          {/* LEASE MILEAGE OPTION */}
          {formData.planType === 'lease' && (
            <div className="edit-group">
              <h4>Annual Mileage</h4>
              <div className="input-group">
                <label>Mileage per Year: {formData.annualMileage.toLocaleString()} miles</label>
                <div className="slider-container">
                  <span className="slider-label">10,000</span>
                  <input
                    type="range"
                    name="annualMileage"
                    value={formData.annualMileage}
                    onChange={handleInputChange}
                    min="10000"
                    max="20000"
                    step="1000"
                    className="form-slider"
                  />
                  <span className="slider-label">20,000</span>
                </div>
                <small>Higher mileage increases your monthly payment</small>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="button-container">
        <button onClick={handleNext} className="nav-button submit-button">
          View Payment Results →
        </button>
        <Link to="/payment-info">
          <button type="button" className="nav-button">
            ← Back to Payment Info
          </button>
        </Link>
      </div>
    </div>
  )
}

export default PlanPreferences
