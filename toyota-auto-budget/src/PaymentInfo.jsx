import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import './App.css'

function PaymentInfo() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialData = location.state?.formData || {}

  const [formData, setFormData] = useState({
    ...initialData,
    downPayment: initialData.downPayment || 0,
    tradeInValue: initialData.tradeInValue || '',
  })

  const [rebates, setRebates] = useState({
    military: initialData.rebates?.military || false,
    college: initialData.rebates?.college || false,
  })

  // helpers
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleRebateChange = (rebateType) => {
    setRebates(prev => ({ ...prev, [rebateType]: !prev[rebateType] }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    navigate('/plan-preferences', {
      state: {
        formData: {
          ...formData,
          rebates,
        },
      },
    })
  }

  return (
    <div className="container">
      <h1>Payment Information</h1>
      <p>Enter your payment and rebate details</p>

      <div className="adjustment-controls">
        <div className="edit-form">
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

          {/* TRADE-IN VALUE */}
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
          </div>

          {/* REBATES SECTION */}
          <div className="edit-group">
            <h4>Available Rebates</h4>
            <div className="input-row">
              <div className="input-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rebates.military}
                    onChange={() => handleRebateChange('military')}
                  />
                  <span className="checkbox-text">Military - $500</span>
                </label>
              </div>
              <div className="input-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rebates.college}
                    onChange={() => handleRebateChange('college')}
                  />
                  <span className="checkbox-text">College - $500</span>
                </label>
              </div>
            </div>

            {(rebates.military || rebates.college) && (
              <div className="rebate-savings">
                <small>
                  Total Savings: $
                  {(rebates.military ? 500 : 0) + (rebates.college ? 500 : 0)}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="button-container">
        <button onClick={handleNext} className="nav-button submit-button">
          Continue to Plan Preferences →
        </button>
        <Link to="/financial-info">
          <button type="button" className="nav-button">
            ← Back to Financial Info
          </button>
        </Link>
      </div>
    </div>
  )
}

export default PaymentInfo
