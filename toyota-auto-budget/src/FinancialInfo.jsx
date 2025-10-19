import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import './App.css'

function FinancialInformation() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialData = location.state?.formData || {}

  const [formData, setFormData] = useState({
    ...initialData,
    creditScore: initialData.creditScore || 700,
    income: initialData.income || '',
    downPayment: initialData.downPayment || 0,
    tradeInValue: initialData.tradeInValue || '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    const numericFields = ['income', 'tradeInValue']
    if (numericFields.includes(name) && value) {
      const clean = value.replace(/[^\d]/g, '')
      if (clean && clean.length >= 4) {
        setFormData(prev => ({ ...prev, [name]: formatNumberWithCommas(clean) }))
      }
    }
  }

  const formatNumberWithCommas = (value) => {
    if (!value) return ''
    const stringValue = value.toString().replace(/,/g, '')
    const numericValue = stringValue.replace(/[^\d]/g, '')
    if (numericValue.length >= 4) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    return numericValue
  }

  const parseFormattedNumber = (value) => {
    if (!value) return ''
    return value.toString().replace(/,/g, '')
  }

  const getCreditScoreRange = (score) => {
    if (score >= 720) return 'Excellent (720+)'
    if (score >= 690) return 'Great (690-719)'
    if (score >= 670) return 'Very Good (670-689)'
    if (score >= 650) return 'Good (650-669)'
    if (score >= 630) return 'Fair (630-649)'
    if (score >= 610) return 'Poor (610-629)'
    if (score >= 580) return 'Very Poor (580-609)'
    if (score >= 520) return 'Extremely Poor (520-579)'
    return 'Unknown'
  }

  const handleNext = (e) => {
    e.preventDefault()
    navigate('/payment-info', { state: { formData } })
  }

  return (
    <div className="container">
      <h1>Financial Information</h1>
      <p>Adjust your credit and financial details to plan your budget</p>

      <div className="adjustment-controls">
        <div className="edit-form">
          {/* CREDIT SCORE SLIDER */}
          <div className="edit-group">
            <h4>Credit Score</h4>
            <div className="input-group">
              <label>Credit Score: {formData.creditScore}</label>
              <div className="slider-container">
                <span className="slider-label">300</span>
                <input
                  type="range"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  min="300"
                  max="850"
                  className="form-slider"
                />
                <span className="slider-label">850</span>
              </div>
              <small className="credit-range">
                {getCreditScoreRange(parseInt(formData.creditScore))}
              </small>
            </div>
            <a href="https://www.experian.com/lp/credit-score-unbr/" target="_blank">Whats my credit score?</a>
          </div>

          {/* INCOME INPUT */}
          <div className="edit-group">
            <h4>Annual Income</h4>
            <div className="input-group">
              <label>Income ($ - Optional):</label>
              <input
                type="text"
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="50,000"
              />
              <small>Helps provide better financing insights</small>
            </div>
          </div>

          {/* DOWN PAYMENT SLIDER */}
          <div className="edit-group">
            <h4>Down Payment</h4>
            <div className="input-group">
              <label>
                Down Payment: ${parseInt(formData.downPayment || 0).toLocaleString()}
              </label>
              <div className="slider-container">
                <span className="slider-label">$0</span>
                <input
                  type="range"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleInputChange}
                  min="0"
                  max={parseFormattedNumber(initialData.msrp) || 50000}
                  step="500"
                  className="form-slider"
                />
                <span className="slider-label">
                  ${parseInt(parseFormattedNumber(initialData.msrp) || 50000).toLocaleString()}
                </span>
              </div>
              <small>
                Max: Vehicle MSRP (${parseInt(parseFormattedNumber(initialData.msrp) || 50000).toLocaleString()})
              </small>
            </div>
          </div>

          {/* TRADE-IN VALUE INPUT */}
          <div className="edit-group">
            <h4>Trade-in Value</h4>
            <div className="input-group">
              <label>Trade-in Value ($ - Optional):</label>
              <input
                type="text"
                name="tradeInValue"
                value={formData.tradeInValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="10,000"
              />
            </div>
            <a href="https://www.kbb.com/whats-my-car-worth/" target="_blank">Whats my car's value?</a>
          </div>
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="button-container">
        <button onClick={handleNext} className="nav-button submit-button">
          Continue to Payment Info →
        </button>
        <Link to="/vehicle-info">
          <button type="button" className="nav-button">← Back to Vehicle Info</button>
        </Link>
      </div>
    </div>
  )
}

export default FinancialInformation
