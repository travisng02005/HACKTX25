import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import './App.css'

function FinancialInformation() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialData = location.state?.formData || {}

  // Add gradient background class and scroll to top
  useEffect(() => {
    document.body.classList.add('financial-info-page')
    window.scrollTo(0, 0) // Scroll to top when component mounts
    return () => {
      document.body.classList.remove('financial-info-page')
    }
  }, [])

  const [formData, setFormData] = useState({
    ...initialData,
    creditScore: initialData.creditScore || 700,
    downPayment: initialData.downPayment || 0,
    tradeInValue: initialData.tradeInValue || '',
    planType: initialData.planType || 'loan',
    termLength: initialData.termLength || '60',
    annualMileage: initialData.annualMileage || '12000',
  })

  const [rebates, setRebates] = useState({
    military: initialData.rebates?.military || false,
    college: initialData.rebates?.college || false,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRebateChange = (rebateType) => {
    setRebates(prev => ({ ...prev, [rebateType]: !prev[rebateType] }))
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    const numericFields = ['tradeInValue']
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
    navigate('/personal-info', { 
      state: { 
        formData: {
          ...formData,
          rebates,
        }
      } 
    })
  }

  return (
    <div className="container">
      <h1>Financial Information</h1>
      <p>Adjust your credit and financial details to plan your budget</p>

      <div className="adjustment-controls">
        <div className="edit-form">
          {/* Row 1: Credit Score, Down Payment */}
          <div className="edit-sections-row">
            {/* CREDIT SCORE SLIDER */}
            <div className="edit-group">
              <h4>
                Credit Score
                <div className="tooltip-container">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    Your credit score affects your loan terms and interest rates. Higher scores typically get:
                    <br />• Lower interest rates
                    <br />• Better loan terms
                    <br />• Higher approval chances
                    <br />• More financing options
                  </div>
                </div>
              </h4>
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

            {/* DOWN PAYMENT SLIDER */}
            <div className="edit-group">
              <h4>
                Down Payment
                <div className="tooltip-container">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    A down payment reduces your loan amount and monthly payments. A larger down payment typically means:
                    <br />• Lower monthly payments
                    <br />• Less interest paid over time
                    <br />• Better loan terms
                    <br />• Lower total cost of ownership
                  </div>
                </div>
              </h4>
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
          </div>

          {/* Row 2: Trade-in Value, Available Rebates, Plan Type */}
          <div className="edit-sections-row">
            {/* TRADE-IN VALUE INPUT */}
            <div className="edit-group">
              <h4>
                Trade-in Value
                <div className="tooltip-container">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    Trading in your current vehicle reduces the total amount you need to finance. Benefits include:
                    <br />• Lower loan amount
                    <br />• Reduced monthly payments
                    <br />• Simplified process
                    <br />• Potential tax savings
                  </div>
                </div>
              </h4>
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

            {/* REBATES SECTION */}
            <div className="edit-group">
              <h4>
                Available Rebates
                <div className="tooltip-container">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    Toyota offers special rebates for qualified buyers that reduce your vehicle's final price:
                    <br />• Military: $500 for active duty, veterans, and retirees
                    <br />• College: $500 for recent graduates and current students
                    <br />• Rebates can be combined with other offers
                  </div>
                </div>
              </h4>
              <div className="input-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rebates.military}
                    onChange={() => handleRebateChange('military')}
                  />
                  <span className="checkbox-text">Military - $500</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rebates.college}
                    onChange={() => handleRebateChange('college')}
                  />
                  <span className="checkbox-text">College - $500</span>
                </label>
              </div>
              <small>
                {(rebates.military || rebates.college) ? (
                  `Total Savings: $${(rebates.military ? 500 : 0) + (rebates.college ? 500 : 0)}`
                ) : (
                  'Select applicable rebates to see savings.'
                )}
              </small>
            </div>

            {/* PLAN TYPE */}
            <div className="edit-group">
              <h4>
                Plan Type
                <div className="tooltip-container">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    Choose between loan (financing) or lease based on your needs:
                    <br />• <strong>Loan:</strong> Own the vehicle, build equity, no mileage limits
                    <br />• <strong>Lease:</strong> Lower payments, newer features, return at end
                    <br />• Consider your driving habits and long-term plans
                  </div>
                </div>
              </h4>
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
          </div>

          {/* LEASE MILEAGE OPTION - Full Width */}
          {formData.planType === 'lease' && (
            <div className="edit-group">
              <h4>
                Annual Mileage
                <div className="tooltip-container">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    Choose your expected annual mileage for your lease term:
                    <br />• <strong>Lower mileage:</strong> Cheaper monthly payments
                    <br />• <strong>Higher mileage:</strong> More expensive but avoid overage fees
                    <br />• Excess mileage fees: typically $0.15-$0.25 per mile
                    <br />• Plan conservatively to avoid surprise costs
                  </div>
                </div>
              </h4>
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
        <Link to="/vehicle-info">
          <button type="button" className="nav-button">← Back to Vehicle Info</button>
        </Link>
      </div>
    </div>
  )
}

export default FinancialInformation
