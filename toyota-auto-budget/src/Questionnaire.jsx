import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './App.css'

function Questionnaire() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get pre-filled data from navigation state (from Matchmaker)
  const prefilledData = location.state?.prefilledData || {}
  
  const [formData, setFormData] = useState({
    // Vehicle Info
    msrp: prefilledData.msrp || '',
    model: prefilledData.model || '',
    trim: '',
    year: prefilledData.year || '2026',
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
  const [prefilledMessage, setPrefilledMessage] = useState('')

  // Show message when data is pre-filled from Matchmaker
  useEffect(() => {
    if (prefilledData.model) {
      setPrefilledMessage(`✅ Vehicle information pre-filled from your ${prefilledData.model} match!`)
      // Clear message after 5 seconds
      setTimeout(() => setPrefilledMessage(''), 5000)
    }
  }, [prefilledData.model])

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

  return (
    <div className="container">
      <h1>Vehicle Information</h1>
      <p>Tell us about your Toyota vehicle</p>
      
      {/* Pre-filled message */}
      {prefilledMessage && (
        <div className="prefilled-message">
          {prefilledMessage}
        </div>
      )}
      
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
        <h3>Option 2: Enter Vehicle Details Manually</h3>
        <form onSubmit={handleFormSubmit} className="questionnaire-form">
          
          {/* Vehicle Information */}
          <fieldset className="form-group">
            <legend>Vehicle Information</legend>
            
            <div className="input-row">
              <div className="input-group">
                <label>Model:</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., RAV4"
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Trim:</label>
                <input
                  type="text"
                  name="trim"
                  value={formData.trim}
                  onChange={handleInputChange}
                  placeholder="e.g., XLE Hybrid"
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

          <div className="button-container">
            <button type="submit" className="nav-button submit-button">
              Continue to Payment Planning
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