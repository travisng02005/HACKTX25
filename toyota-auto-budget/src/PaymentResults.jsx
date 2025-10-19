import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import RAV4Model from './RAV4Model'
import toyotaVehicles from './data/toyotaVehicles.json'
import './App.css'

function PaymentResults() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get form data from navigation state or redirect if none
  const initialData = location.state?.formData
  
  useEffect(() => {
    if (!initialData) {
      navigate('/vehicle-info')
    }
  }, [initialData, navigate])

  // Update rebates when initialData changes
  useEffect(() => {
    if (initialData?.rebates) {
      setRebates({
        military: initialData.rebates.military || false,
        college: initialData.rebates.college || false
      })
    }
  }, [initialData])

  // Add gradient background class
  useEffect(() => {
    document.body.classList.add('payment-results-page')
    return () => {
      document.body.classList.remove('payment-results-page')
    }
  }, [])

  const [formData, setFormData] = useState(initialData || {
    msrp: '',
    make: 'Toyota',
    model: '',
    trim: '',
    year: '2026',
    color: '',
    creditScore: '',
    income: '',
    downPayment: '',
    tradeInValue: '',
    planType: 'loan',
    termLength: '60',
    housingBudget: '',
    foodBudget: '',
    utilitiesBudget: '',
    otherBudget: ''
  })

  const [paymentCalculations, setPaymentCalculations] = useState({})
  const [planComparisonType, setPlanComparisonType] = useState('financing') // 'financing' or 'leasing'
  const [rebates, setRebates] = useState({
    military: initialData?.rebates?.military || false,
    college: initialData?.rebates?.college || false
  })

  // Ref for payment plan options section
  const paymentPlanRef = useRef(null)

  // Console log every time formData changes
  useEffect(() => {
    console.log('Form data updated:', formData)
    calculatePayments()
  }, [formData, rebates])

  // Scroll to Payment Plan Options when component mounts or when navigating from PersonalInfo
  useEffect(() => {
    if (paymentPlanRef.current) {
      setTimeout(() => {
        paymentPlanRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 500) // Small delay to allow content to render and calculations to complete
    }
  }, [location.state]) // Trigger on location state change (navigation from PersonalInfo)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInputBlur = (e) => {
    const { name, value } = e.target
    
    // List of numeric fields that should be formatted with commas
    const numericFields = ['msrp', 'income', 'tradeInValue', 'housingBudget', 'foodBudget', 'utilitiesBudget', 'otherBudget']
    
    if (numericFields.includes(name) && value) {
      // Clean and format the value when user finishes typing
      const cleanValue = value.replace(/[^\d]/g, '') // Remove all non-digits
      if (cleanValue && cleanValue.length >= 4) {
        const formattedValue = formatNumberWithCommas(cleanValue)
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue
        }))
      }
    }
  }

  const handleModelChange = (e) => {
    const { value } = e.target
    setFormData(prev => {
      const basePrice = toyotaVehicles[value]?.basePrice
      const formattedPrice = basePrice ? formatNumberWithCommas(basePrice.toString()) : prev.msrp
      
      return {
        ...prev,
        model: value,
        trim: '', // Reset trim when model changes
        msrp: formattedPrice
      }
    })
  }

  const handleTrimChange = (e) => {
    const { value } = e.target
    setFormData(prev => {
      const selectedTrim = toyotaVehicles[formData.model]?.trims.find(trim => trim.name === value)
      const trimPrice = selectedTrim?.price
      const formattedPrice = trimPrice ? formatNumberWithCommas(trimPrice.toString()) : prev.msrp
      
      return {
        ...prev,
        trim: value,
        msrp: formattedPrice
      }
    })
  }

  const handleRebateChange = (rebateType) => {
    setRebates(prev => {
      const newRebates = {
        ...prev,
        [rebateType]: !prev[rebateType]
      }
      
      // Update MSRP based on rebates
      const basePrice = parseFloat(formData.msrp) || 0
      const militaryDiscount = newRebates.military ? 500 : 0
      const collegeDiscount = newRebates.college ? 500 : 0
      
      return newRebates
    })
  }

  // Calculate effective MSRP with rebates
  const getEffectiveMSRP = () => {
    const basePrice = parseFloat(parseFormattedNumber(formData.msrp)) || 0
    const militaryDiscount = rebates.military ? 500 : 0
    const collegeDiscount = rebates.college ? 500 : 0
    return basePrice - militaryDiscount - collegeDiscount
  }

  // Format number with commas for display
  const formatNumberWithCommas = (value) => {
    if (!value) return ''
    // Convert to string and remove any existing commas
    const stringValue = value.toString().replace(/,/g, '')
    // Only keep digits (no decimal points for these fields)
    const numericValue = stringValue.replace(/[^\d]/g, '')
    // Return the numeric value with commas if 4+ digits
    if (numericValue.length >= 4) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    return numericValue
  }

  // Parse formatted number back to plain number for calculations
  const parseFormattedNumber = (value) => {
    if (!value) return ''
    return value.toString().replace(/,/g, '')
  }

  const calculatePayments = () => {
    const msrp = getEffectiveMSRP()
    const downPayment = parseFloat(formData.downPayment) || 0
    const tradeInValue = parseFloat(parseFormattedNumber(formData.tradeInValue)) || 0
    const creditScore = parseInt(formData.creditScore) || 700
    const termLength = parseInt(formData.termLength) || 60

    // Calculate interest rate based on credit score and term length
    let interestRate
    
    // Determine APR based on credit score ranges and term length
    if (termLength === 72) {
      // 72 month rates
      if (creditScore >= 720) interestRate = 0.0911      // Excellent 720+: 9.11%
      else if (creditScore >= 690) interestRate = 0.1005 // Great 719-690: 10.05%
      else if (creditScore >= 670) interestRate = 0.1257 // Very Good 689-670: 12.57%
      else if (creditScore >= 650) interestRate = 0.1298 // Good 669-650: 12.98%
      else if (creditScore >= 630) interestRate = 0.1399 // Fair 649-630: 13.99%
      else if (creditScore >= 610) interestRate = 0.1649 // Poor 629-610: 16.49%
      else if (creditScore >= 580) interestRate = 0.1800 // Very Poor 609-580: 18.00%
      else interestRate = 0.1800                          // Extremely Poor 579-520: 18.00%
    } else {
      // 24, 48, 60 month rates
      if (creditScore >= 720) interestRate = 0.0872      // Excellent 720+: 8.72%
      else if (creditScore >= 690) interestRate = 0.0949 // Great 719-690: 9.49%
      else if (creditScore >= 670) interestRate = 0.1177 // Very Good 689-670: 11.77%
      else if (creditScore >= 650) interestRate = 0.1252 // Good 669-650: 12.52%
      else if (creditScore >= 630) interestRate = 0.1361 // Fair 649-630: 13.61%
      else if (creditScore >= 610) interestRate = 0.1553 // Poor 629-610: 15.53%
      else if (creditScore >= 580) interestRate = 0.1769 // Very Poor 609-580: 17.69%
      else interestRate = 0.1800                          // Extremely Poor 579-520: 18.00%
    }

    // Calculate loan amount with typical fees (taxes, title, etc.)
    const taxesAndFees = msrp * 0.08 // Approximate 8% for taxes, title, licensing
    const financedAmount = msrp + taxesAndFees - downPayment - tradeInValue
    
    if (formData.planType === 'loan') {
      // Loan calculation using standard amortization formula
      const monthlyRate = interestRate / 12
      let monthlyPayment
      
      if (monthlyRate === 0) {
        monthlyPayment = financedAmount / termLength
      } else {
        monthlyPayment = financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, termLength)) / 
                        (Math.pow(1 + monthlyRate, termLength) - 1)
      }
      
      const totalCost = monthlyPayment * termLength + downPayment
      const totalInterest = (monthlyPayment * termLength) - financedAmount

      setPaymentCalculations({
        monthlyPayment: monthlyPayment.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        loanAmount: financedAmount.toFixed(2),
        interestRate: (interestRate * 100).toFixed(2),
        taxesAndFees: taxesAndFees.toFixed(2)
      })
    } else {
      // Lease calculation (simplified)
      const residualValue = msrp * 0.5 // Assume 50% residual after lease term
      const depreciationAmount = msrp - residualValue
      const monthlyDepreciation = depreciationAmount / termLength
      const monthlyFinanceCharge = (msrp + residualValue) * (interestRate / 12)
      const monthlyPayment = monthlyDepreciation + monthlyFinanceCharge

      const totalCost = monthlyPayment * termLength + downPayment
      
      setPaymentCalculations({
        monthlyPayment: monthlyPayment.toFixed(2),
        totalCost: totalCost.toFixed(2),
        residualValue: residualValue.toFixed(2),
        loanAmount: msrp.toFixed(2),
        interestRate: (interestRate * 100).toFixed(2),
        taxesAndFees: taxesAndFees.toFixed(2)
      })
    }
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

  const getFinancingTips = () => {
    const creditScore = parseInt(formData.creditScore) || 700
    const income = parseFloat(parseFormattedNumber(formData.income)) || 0
    const monthlyPayment = parseFloat(paymentCalculations.monthlyPayment) || 0
    
    const tips = []
    
    if (creditScore < 670) {
      tips.push("💡 Consider improving your credit score for better rates")
    }
    
    if (income > 0 && (monthlyPayment * 12) / income > 0.2) {
      tips.push("⚠️ Payment may be high relative to income (>20%)")
    }
    
    if (parseFloat(formData.downPayment) < parseFloat(parseFormattedNumber(formData.msrp)) * 0.2) {
      tips.push("💰 Consider a larger down payment to reduce monthly costs")
    }
    
    if (formData.planType === 'loan' && parseInt(formData.termLength) > 60) {
      tips.push("📅 Shorter loan terms save money on interest")
    }
    
    return tips
  }

  // Calculate payment for a specific plan configuration
  const calculatePlanPayment = (planType, termLength, annualMileage = null) => {
    const msrp = getEffectiveMSRP()
    const downPayment = parseFloat(formData.downPayment) || 0
    const tradeInValue = parseFloat(parseFormattedNumber(formData.tradeInValue)) || 0
    const creditScore = parseInt(formData.creditScore) || 700
    
    // Calculate taxes and fees (8.5% tax + $500 fees)
    const taxRate = 0.085
    const fees = 500
    const taxesAndFees = (msrp * taxRate) + fees
    
    const financedAmount = msrp + taxesAndFees - downPayment - tradeInValue
    
    // Determine interest rate based on credit score and term length
    let interestRate = 0.045 // Base rate
    if (creditScore >= 720) interestRate = 0.035
    else if (creditScore >= 690) interestRate = 0.045
    else if (creditScore >= 670) interestRate = 0.055
    else if (creditScore >= 650) interestRate = 0.065
    else if (creditScore >= 630) interestRate = 0.075
    else if (creditScore >= 610) interestRate = 0.085
    else if (creditScore >= 580) interestRate = 0.095
    else interestRate = 0.105
    
    // Adjust rate for term length (higher rates for longer terms)
    if (termLength === 72) interestRate += 0.005
    if (termLength === 84) interestRate += 0.01
    
    const monthlyRate = interestRate / 12
    let monthlyPayment = 0
    let totalCost = 0
    let totalInterest = 0
    
    if (planType === 'financing') {
      // Financing calculation
      if (monthlyRate === 0) {
        monthlyPayment = financedAmount / termLength
      } else {
        monthlyPayment = financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, termLength)) / 
                        (Math.pow(1 + monthlyRate, termLength) - 1)
      }
      totalCost = monthlyPayment * termLength + downPayment
      totalInterest = (monthlyPayment * termLength) - financedAmount
    } else {
      // Leasing calculation
      const residualPercentage = 0.55 // Typical 55% residual value
      const residualValue = msrp * residualPercentage
      const depreciationAmount = msrp - residualValue
      
      const monthlyDepreciation = depreciationAmount / termLength
      const monthlyFinanceCharge = (msrp + residualValue) * (interestRate / 12)
      const mileageAdjustment = annualMileage > 12000 ? (annualMileage - 12000) * 0.25 / 12 : 0
      
      monthlyPayment = monthlyDepreciation + monthlyFinanceCharge + mileageAdjustment
      totalCost = monthlyPayment * termLength + downPayment
      totalInterest = monthlyFinanceCharge * termLength
    }
    
    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      interestRate: (interestRate * 100).toFixed(2),
      termLength,
      annualMileage,
      planType
    }
  }

  // Get all available financing plans
  const getFinancingPlans = () => {
    const terms = [24, 36, 48, 60, 72]
    return terms.map(term => calculatePlanPayment('financing', term))
  }

  // Get all available leasing plans
  const getLeasingPlans = () => {
    const terms = [24, 36, 48, 60]
    const mileageOptions = [10000, 12000, 15000]
    const plans = []
    
    terms.forEach(term => {
      mileageOptions.forEach(mileage => {
        plans.push(calculatePlanPayment('leasing', term, mileage))
      })
    })
    
    return plans
  }

  if (!initialData) {
    return <div>Loading...</div>
  }

  return (
    <div className="container payment-results">
      <h1>Payment Plan Results</h1>
      <p>Your personalized Toyota payment plan</p>

      {/* 3D RAV4 Model */}
      <div className="model-section">
        <h2 style={{ color: '#d32f2f' }}>
          Your {formData.model || 'Toyota RAV4'}
          {formData.trim ? ` ${formData.trim}` : ''}
        </h2>
        <div className="model-viewer">
          <Canvas camera={{ position: [50, 30, 50], fov: 75 }}>
            <ambientLight intensity={0.8} />
            <spotLight position={[100, 100, 100]} angle={0.3} penumbra={1} intensity={1} />
            <pointLight position={[-80, 40, -80]} intensity={0.6} />
            <directionalLight position={[40, 80, 20]} intensity={0.5} />
            <RAV4Model modelPath="/models/2023_toyota_rav4_hybrid.glb" />
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              enableRotate={true}
              maxDistance={200}
              minDistance={30}
              target={[0, 0, 0]}
            />
            <Environment preset="sunset" />
          </Canvas>
        </div>
        <p className="model-instructions">
          🖱️ Click and drag to rotate • Scroll to zoom
        </p>
      </div>

      {/* Accessible Adjustment Controls */}
      <div className="adjustment-controls">
        <h2>Customize Your Options</h2>
        
        <div className="edit-form">
          {/* Row 1: Vehicle Information and Financial Information Side by Side */}
          <div className="edit-sections-row">
            {/* Vehicle Information */}
            <div className="edit-group">
              <h4>Vehicle Information</h4>
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
                    {Object.keys(toyotaVehicles).map(model => (
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
                    {formData.model && toyotaVehicles[formData.model]?.trims.map(trim => (
                      <option key={trim.name} value={trim.name}>{trim.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>MSRP ($):</label>
                  <input
                    type="text"
                    name="msrp"
                    value={formData.msrp}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                  />
                  {formData.trim && (
                    <small className="helper-text">Pre-filled from selected trim - feel free to adjust</small>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="edit-group">
              <h4>Financial Information</h4>
              
              {/* Credit Score Slider */}
              <div className="input-group">
                <label>Credit Score: {formData.creditScore || 700}</label>
                <div className="slider-container">
                  <span className="slider-label">300</span>
                  <input
                    type="range"
                    name="creditScore"
                    value={formData.creditScore || 700}
                    onChange={handleInputChange}
                    min="300"
                    max="850"
                    className="form-slider"
                  />
                  <span className="slider-label">850</span>
                </div>
                {formData.creditScore && (
                  <small className="credit-range">
                    {getCreditScoreRange(parseInt(formData.creditScore))}
                  </small>
                )}
              </div>

              {/* Annual Income Input */}
              <div className="input-row">
                <div className="input-group">
                  <label>Annual Income ($ - Optional):</label>
                  <input
                    type="text"
                    name="income"
                    value={formData.income}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="50,000"
                  />
                  <small>Helps provide better financing tips</small>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Payment Information and Compare Payment Plans Side by Side */}
          <div className="edit-sections-row">
            {/* Payment Information */}
            <div className="edit-group">
              <h4>Payment Information</h4>
              
              {/* Down Payment Slider */}
              <div className="input-group">
                <label>Down Payment: ${parseInt(formData.downPayment || 0).toLocaleString()}</label>
                <div className="slider-container">
                  <span className="slider-label">$0</span>
                  <input
                    type="range"
                    name="downPayment"
                    value={formData.downPayment || 0}
                    onChange={handleInputChange}
                    min="0"
                    max={parseFormattedNumber(formData.msrp) || 50000}
                    step="500"
                    className="form-slider"
                  />
                  <span className="slider-label">${parseInt(parseFormattedNumber(formData.msrp) || 50000).toLocaleString()}</span>
                </div>
                <small>Max: Vehicle MSRP (${parseInt(parseFormattedNumber(formData.msrp) || 50000).toLocaleString()})</small>
              </div>

              {/* Trade-in Value Input */}
              <div className="input-row">
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
            </div>

            {/* Rebates Section */}
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
                  <small>Total Savings: ${(rebates.military ? 500 : 0) + (rebates.college ? 500 : 0)}</small>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Monthly Budget Information */}
          <div className="edit-sections-row">
            <div className="edit-group">
              <h4>Monthly Budget</h4>
              <p style={{margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem'}}>
                Adjust your monthly spending estimates for better recommendations
              </p>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Housing:</label>
                  <input
                    type="text"
                    name="housingBudget"
                    value={formData.housingBudget || ''}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="1,500"
                  />
                  <small>Rent/mortgage, property taxes, insurance</small>
                </div>
                
                <div className="input-group">
                  <label>Food:</label>
                  <input
                    type="text"
                    name="foodBudget"
                    value={formData.foodBudget || ''}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="600"
                  />
                  <small>Groceries, dining out, beverages</small>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Utilities:</label>
                  <input
                    type="text"
                    name="utilitiesBudget"
                    value={formData.utilitiesBudget || ''}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="200"
                  />
                  <small>Electricity, gas, water, internet, phone</small>
                </div>
                
                <div className="input-group">
                  <label>Other:</label>
                  <input
                    type="text"
                    name="otherBudget"
                    value={formData.otherBudget || ''}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="400"
                  />
                  <small>Entertainment, shopping, subscriptions, etc.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison Cards */}
      <div className="plan-comparison-section" ref={paymentPlanRef}>
        <div className="plan-type-selector">
          <h2>Payment Plan Options</h2>
          <select 
            value={planComparisonType} 
            onChange={(e) => setPlanComparisonType(e.target.value)}
            className="plan-type-select"
          >
            <option value="financing">Financing Plans</option>
            <option value="leasing">Leasing Plans</option>
          </select>
        </div>
        <h3>{planComparisonType === 'financing' ? 'Financing' : 'Leasing'} Options</h3>
        <div className="plans-grid">
          {planComparisonType === 'financing' ? (
            getFinancingPlans().map((plan, index) => (
              <div key={index} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.termLength} Months</h3>
                  <span className="plan-type">Financing</span>
                </div>
                <div className="plan-payment">
                  <div className="monthly-payment">
                    <span className="amount">${parseFloat(plan.monthlyPayment).toLocaleString()}</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <div className="plan-details">
                  <div className="detail-item">
                    <span>APR:</span>
                    <span>{plan.interestRate}%</span>
                  </div>
                  <div className="detail-item">
                    <span>Total Cost:</span>
                    <span>${parseFloat(plan.totalCost).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Total Interest:</span>
                    <span>${parseFloat(plan.totalInterest).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Term:</span>
                    <span>{plan.termLength} months</span>
                  </div>
                </div>
                <button 
                  className="select-plan-btn"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      planType: 'loan',
                      termLength: plan.termLength.toString()
                    }))
                  }}
                >
                  Select This Plan
                </button>
              </div>
            ))
          ) : (
            getLeasingPlans().map((plan, index) => (
              <div key={index} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.termLength} Months</h3>
                  <span className="plan-type">Lease</span>
                </div>
                <div className="plan-payment">
                  <div className="monthly-payment">
                    <span className="amount">${parseFloat(plan.monthlyPayment).toLocaleString()}</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <div className="plan-details">
                  <div className="detail-item">
                    <span>Mileage:</span>
                    <span>{plan.annualMileage?.toLocaleString()}/year</span>
                  </div>
                  <div className="detail-item">
                    <span>Total Cost:</span>
                    <span>${parseFloat(plan.totalCost).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Money Factor:</span>
                    <span>{plan.interestRate}%</span>
                  </div>
                  <div className="detail-item">
                    <span>Term:</span>
                    <span>{plan.termLength} months</span>
                  </div>
                </div>
                <button 
                  className="select-plan-btn"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      planType: 'lease',
                      termLength: plan.termLength.toString()
                    }))
                  }}
                >
                  Select This Plan
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="button-container">
        <Link to="/">
          <button className="nav-button">Back to Home</button>
        </Link>
      </div>
    </div>
  )
}

export default PaymentResults