import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import './App.css'

function PersonalInfo() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialData = location.state?.formData || {}

  // Add gradient background class and scroll to top
  useEffect(() => {
    document.body.classList.add('financial-info-page')
    window.scrollTo(0, 0)
    return () => {
      document.body.classList.remove('financial-info-page')
    }
  }, [])

  const [formData, setFormData] = useState({
    ...initialData,
    income: initialData.income || '',
    housingBudget: initialData.housingBudget || '',
    foodBudget: initialData.foodBudget || '',
    utilitiesBudget: initialData.utilitiesBudget || '',
    otherBudget: initialData.otherBudget || ''
  })

  const [errors, setErrors] = useState({})

  // Number formatting function
  const formatNumber = (value) => {
    if (!value) return ''
    const number = value.toString().replace(/[^\d]/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleNumberInputBlur = (e) => {
    const { name, value } = e.target
    const formattedValue = formatNumber(value)
    setFormData(prevData => ({
      ...prevData,
      [name]: formattedValue
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.income) {
      newErrors.income = 'Annual income is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Convert formatted numbers back to plain numbers
    const cleanData = {
      ...formData,
      income: formData.income.replace(/,/g, ''),
      housingBudget: formData.housingBudget.replace(/,/g, ''),
      foodBudget: formData.foodBudget.replace(/,/g, ''),
      utilitiesBudget: formData.utilitiesBudget.replace(/,/g, ''),
      otherBudget: formData.otherBudget.replace(/,/g, '')
    }

    navigate('/payment-results', { 
      state: { 
        formData: cleanData
      } 
    })
  }

  const handleBack = () => {
    navigate('/financial-info', { 
      state: { 
        formData: {
          ...formData,
          income: formData.income.replace(/,/g, ''),
          housingBudget: formData.housingBudget.replace(/,/g, ''),
          foodBudget: formData.foodBudget.replace(/,/g, ''),
          utilitiesBudget: formData.utilitiesBudget.replace(/,/g, ''),
          otherBudget: formData.otherBudget.replace(/,/g, '')
        }
      } 
    })
  }

  return (
    <div className="container">
      <h1>Personal Information</h1>
      <p>Tell us about your income and monthly budget</p>
      
      <form className="questionnaire-form" onSubmit={handleSubmit}>
        {/* Annual Income Section */}
        <fieldset className="form-group">
          <legend>Annual Income</legend>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="income">Annual Income *</label>
              <input
                type="text"
                id="income"
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                onBlur={handleNumberInputBlur}
                placeholder="e.g., 75,000"
                required
              />
              <small>Enter your total annual income before taxes</small>
              {errors.income && <div className="error-message">{errors.income}</div>}
            </div>
          </div>
        </fieldset>

        {/* Monthly Budget Section */}
        <fieldset className="form-group">
          <legend>Current Monthly Budget</legend>
          <p style={{margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem'}}>
            Enter your estimated monthly spending in each category (optional but helpful for better recommendations)
          </p>
          
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="housingBudget">Housing</label>
              <input
                type="text"
                id="housingBudget"
                name="housingBudget"
                value={formData.housingBudget}
                onChange={handleInputChange}
                onBlur={handleNumberInputBlur}
                placeholder="e.g., 1,500"
              />
              <small>Rent/mortgage, property taxes, insurance</small>
            </div>
            
            <div className="input-group">
              <label htmlFor="foodBudget">Food</label>
              <input
                type="text"
                id="foodBudget"
                name="foodBudget"
                value={formData.foodBudget}
                onChange={handleInputChange}
                onBlur={handleNumberInputBlur}
                placeholder="e.g., 600"
              />
              <small>Groceries, dining out, beverages</small>
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="utilitiesBudget">Utilities</label>
              <input
                type="text"
                id="utilitiesBudget"
                name="utilitiesBudget"
                value={formData.utilitiesBudget}
                onChange={handleInputChange}
                onBlur={handleNumberInputBlur}
                placeholder="e.g., 200"
              />
              <small>Electricity, gas, water, internet, phone</small>
            </div>
            
            <div className="input-group">
              <label htmlFor="otherBudget">Other</label>
              <input
                type="text"
                id="otherBudget"
                name="otherBudget"
                value={formData.otherBudget}
                onChange={handleInputChange}
                onBlur={handleNumberInputBlur}
                placeholder="e.g., 400"
              />
              <small>Entertainment, shopping, subscriptions, etc.</small>
            </div>
          </div>
        </fieldset>

        <div className="button-container">
          <button 
            type="button" 
            onClick={handleBack}
            className="nav-button"
            style={{backgroundColor: '#666'}}
          >
            ← Back to Financial Info
          </button>
          <button type="submit" className="nav-button submit-button">
            Continue to Payment Results →
          </button>
        </div>
      </form>
    </div>
  )
}

export default PersonalInfo