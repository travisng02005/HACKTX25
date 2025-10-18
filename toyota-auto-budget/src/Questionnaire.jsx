import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './App.css'

function Questionnaire() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    // Vehicle Info
    msrp: '',
    make: 'Toyota',
    model: '',
    year: '2026',
    color: '',
    
    // User Financial Info
    creditScore: '',
    income: '',
    
    // Payment Inputs
    downPayment: '',
    tradeInValue: '',
    
    // Plan Preferences
    planType: 'loan',
    termLength: '60'
  })

  const [toyotaLink, setToyotaLink] = useState('')
  const [linkError, setLinkError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const parseToyotaLink = (url) => {
    try {
      // Extract model/series from the URL
      const urlParts = url.split('/')
      const seriesIndex = urlParts.indexOf('series')
      const yearIndex = urlParts.indexOf('year')
      
      if (seriesIndex !== -1 && seriesIndex + 1 < urlParts.length) {
        const series = urlParts[seriesIndex + 1]
        const year = yearIndex !== -1 && yearIndex + 1 < urlParts.length ? urlParts[yearIndex + 1] : '2026'
        
        // Convert series name to readable model name
        const modelMap = {
          'corollacross': 'Corolla Cross',
          'corolla': 'Corolla',
          'camry': 'Camry',
          'rav4': 'RAV4',
          'highlander': 'Highlander',
          'prius': 'Prius',
          'sienna': 'Sienna',
          'tacoma': 'Tacoma',
          'tundra': 'Tundra'
        }
        
        const modelName = modelMap[series.toLowerCase()] || series
        
        // Estimated MSRP based on model (these are approximate 2026 prices)
        const msrpMap = {
          'corolla cross': '28000',
          'corolla': '26000',
          'camry': '32000',
          'rav4': '35000',
          'highlander': '42000',
          'prius': '30000',
          'sienna': '45000',
          'tacoma': '38000',
          'tundra': '50000'
        }
        
        const estimatedMSRP = msrpMap[modelName.toLowerCase()] || '35000'
        
        setFormData(prev => ({
          ...prev,
          model: modelName,
          year: year,
          msrp: estimatedMSRP
        }))
        
        setLinkError('')
        return true
      } else {
        setLinkError('Could not parse Toyota configurator link. Please check the URL format.')
        return false
      }
    } catch (error) {
      setLinkError('Invalid URL format. Please paste a valid Toyota configurator link.')
      return false
    }
  }

  const handleLinkSubmit = (e) => {
    e.preventDefault()
    if (toyotaLink.includes('toyota.com/configurator')) {
      parseToyotaLink(toyotaLink)
    } else {
      setLinkError('Please paste a valid Toyota configurator link.')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Navigate to payment results page with form data
    navigate('/payment-results', { state: { formData } })
  }

  const getCreditScoreRange = (score) => {
    if (score >= 800) return 'Excellent (800+)'
    if (score >= 740) return 'Very Good (740-799)'
    if (score >= 670) return 'Good (670-739)'
    if (score >= 580) return 'Fair (580-669)'
    if (score >= 300) return 'Poor (300-579)'
    return 'Unknown'
  }

  return (
    <div className="container">
      <h1>Payment Plan Questionnaire</h1>
      <p>Find the perfect payment plan for your Toyota vehicle</p>
      
      {/* Toyota Link Parser Section */}
      <div className="form-section">
        <h3>Option 1: Paste Your Toyota Build Link</h3>
        <form onSubmit={handleLinkSubmit} className="link-form">
          <input
            type="url"
            value={toyotaLink}
            onChange={(e) => setToyotaLink(e.target.value)}
            placeholder="Paste your Toyota configurator link here..."
            className="link-input"
          />
          <button type="submit" className="parse-button">Parse Vehicle Info</button>
        </form>
        {linkError && <p className="error-message">{linkError}</p>}
      </div>

      <div className="divider">OR</div>

      {/* Manual Form Section */}
      <div className="form-section">
        <h3>Option 2: Fill Out Manually</h3>
        <form onSubmit={handleFormSubmit} className="questionnaire-form">
          
          {/* Vehicle Information */}
          <fieldset className="form-group">
            <legend>Vehicle Information</legend>
            
            <div className="input-row">
              <div className="input-group">
                <label>Make:</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Model:</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Corolla Cross"
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Year:</label>
                <select name="year" value={formData.year} onChange={handleInputChange}>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>MSRP ($):</label>
                <input
                  type="number"
                  name="msrp"
                  value={formData.msrp}
                  onChange={handleInputChange}
                  placeholder="35000"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Color (Optional):</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., Midnight Black"
              />
            </div>
          </fieldset>

          {/* Financial Information */}
          <fieldset className="form-group">
            <legend>Financial Information</legend>
            
            <div className="input-row">
              <div className="input-group">
                <label>Credit Score:</label>
                <input
                  type="number"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  min="300"
                  max="850"
                  placeholder="700"
                  required
                />
                {formData.creditScore && (
                  <small className="credit-range">
                    {getCreditScoreRange(parseInt(formData.creditScore))}
                  </small>
                )}
              </div>
              
              <div className="input-group">
                <label>Annual Income ($ - Optional):</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  placeholder="50000"
                />
                <small>Helps provide better financing tips</small>
              </div>
            </div>
          </fieldset>

          {/* Payment Inputs */}
          <fieldset className="form-group">
            <legend>Payment Information</legend>
            
            <div className="input-row">
              <div className="input-group">
                <label>Down Payment ($):</label>
                <input
                  type="number"
                  name="downPayment"
                  value={formData.downPayment}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="5000"
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Trade-in Value ($ - Optional):</label>
                <input
                  type="number"
                  name="tradeInValue"
                  value={formData.tradeInValue}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="10000"
                />
              </div>
            </div>
          </fieldset>

          {/* Plan Preferences */}
          <fieldset className="form-group">
            <legend>Plan Preferences</legend>
            
            <div className="input-row">
              <div className="input-group">
                <label>Financing Type:</label>
                <select name="planType" value={formData.planType} onChange={handleInputChange}>
                  <option value="loan">Loan (Purchase)</option>
                  <option value="lease">Lease</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>Term Length:</label>
                <select name="termLength" value={formData.termLength} onChange={handleInputChange}>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                  <option value="72">72 months</option>
                  {formData.planType === 'loan' && <option value="84">84 months</option>}
                </select>
              </div>
            </div>
          </fieldset>

          <div className="button-container">
            <button type="submit" className="nav-button submit-button">
              Calculate Payment Plan
            </button>
            <Link to="/">
              <button type="button" className="nav-button">Back to Home</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Questionnaire