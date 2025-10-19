import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toyotaVehicles from './data/toyotaVehicles.json'
import './App.css'

function VehicleInfo() {
  const navigate = useNavigate()
  const location = useLocation()
  const option1Ref = useRef(null)

  const prefilledData = location.state?.prefilledData || {}

  const [formData, setFormData] = useState({
    make: 'Toyota',
    model: prefilledData.model || '',
    trim: prefilledData.trim || '',
    msrp: prefilledData.msrp || '',
    year: prefilledData.year || '2026',
    color: prefilledData.color || ''
  })

  const [toyotaLink, setToyotaLink] = useState('')
  const [linkError, setLinkError] = useState('')
  const [prefilledMessage, setPrefilledMessage] = useState('')

  useEffect(() => {
    if (prefilledData.model) {
      setPrefilledMessage(`✅ Vehicle info pre-filled from your ${prefilledData.model} match!`)
      setTimeout(() => setPrefilledMessage(''), 5000)
    }
  }, [prefilledData.model])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleModelChange = (e) => {
    const selectedModel = e.target.value
    setFormData((prev) => ({
      ...prev,
      model: selectedModel,
      trim: '',
      msrp: selectedModel ? toyotaVehicles[selectedModel].basePrice.toString() : ''
    }))
  }

  const handleTrimChange = (e) => {
    const selectedTrim = e.target.value
    const selectedModel = formData.model

    if (selectedModel && selectedTrim) {
      const trimData = toyotaVehicles[selectedModel].trims.find(
        (trim) => trim.name === selectedTrim
      )
      setFormData((prev) => ({
        ...prev,
        trim: selectedTrim,
        msrp: trimData ? trimData.price.toString() : prev.msrp
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        trim: selectedTrim
      }))
    }
  }

  const parseToyotaLink = (url) => {
    try {
      const urlParts = url.split('/')
      const seriesIndex = urlParts.indexOf('series')
      const yearIndex = urlParts.indexOf('year')

      let model = ''
      let year = ''

      if (seriesIndex !== -1 && seriesIndex + 1 < urlParts.length) {
        const seriesName = urlParts[seriesIndex + 1].toLowerCase()
        const seriesMapping = {
          'rav4': 'RAV4',
          'camry': 'Camry',
          'corolla': 'Corolla',
          'highlander': 'Highlander',
          'prius': 'Prius',
          'sienna': 'Sienna',
          'tacoma': 'Tacoma',
          'tundra': 'Tundra',
          '4runner': '4Runner',
          'corolla-cross': 'Corolla Cross',
          'corollacross': 'Corolla Cross'
        }
        model = seriesMapping[seriesName] || ''
      }

      if (yearIndex !== -1 && yearIndex + 1 < urlParts.length) {
        year = urlParts[yearIndex + 1]
      }

      if (model) {
        setFormData((prev) => ({
          ...prev,
          model,
          year: year || prev.year,
          msrp: toyotaVehicles[model]?.basePrice.toString() || prev.msrp,
          trim: ''
        }))
        setLinkError('')
        setToyotaLink('')
      } else {
        setLinkError('Could not extract vehicle information from this link.')
      }
    } catch {
      setLinkError('Invalid Toyota configurator link format.')
    }
  }

  const handleLinkSubmit = (e) => {
    e.preventDefault()
    if (toyotaLink.includes('toyota.com/configurator')) {
      parseToyotaLink(toyotaLink)
      if (option1Ref.current) {
        option1Ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      setLinkError('Please paste a valid Toyota configurator link.')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    navigate('/financial-info', { state: { formData } })
  }

  return (
    <div className="container">
      <h1>Vehicle Information</h1>
      <p>Tell us about your Toyota</p>

      {prefilledMessage && (
        <div className="prefilled-message">{prefilledMessage}</div>
      )}

      {/* Option 1 - Paste Toyota Configurator Link */}
      <div className="form-section">
        <h3>
          Option 1: Paste Your{' '}
          <span
            className="toyota-build-link"
            onClick={() => window.open('https://www.toyota.com/configurator/', '_blank')}
            title="Click to open Toyota Build & Price"
          >
            Toyota Build
          </span>{' '}
          Link
        </h3>
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

      {/* Option 2 - Manual Entry */}
      <div className="form-section" ref={option1Ref}>
        <h3>Option 2: Enter Vehicle Details Manually</h3>
        <form onSubmit={handleFormSubmit} className="questionnaire-form">
          <fieldset className="form-group">
            <legend>Vehicle Information</legend>

            <div className="input-row">
              <div className="input-group">
                <label>Model:</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleModelChange}
                  required
                >
                  <option value="">Select a Model</option>
                  {Object.keys(toyotaVehicles).map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Trim:</label>
                <select
                  name="trim"
                  value={formData.trim}
                  onChange={handleTrimChange}
                  disabled={!formData.model}
                >
                  <option value="">Select a Trim</option>
                  {formData.model &&
                    toyotaVehicles[formData.model]?.trims.map((trim) => (
                      <option key={trim.name} value={trim.name}>{trim.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>MSRP ($):</label>
                <input
                  type="number"
                  name="msrp"
                  value={formData.msrp}
                  onChange={handleInputChange}
                  placeholder="Enter vehicle price"
                  required
                  readOnly={!!formData.trim}
                  className={formData.trim ? 'readonly-input' : ''}
                />
              </div>

              <div className="input-group">
                <label>Year:</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>

            <div className="input-group full-width">
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
              Continue to Financial Info →
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

export default VehicleInfo
