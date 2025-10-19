import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import RAV4Model from './RAV4Model'
import './App.css'

function PaymentResults() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get form data from navigation state or redirect if none
  const initialData = location.state?.formData
  
  useEffect(() => {
    if (!initialData) {
      navigate('/questionnaire')
      return
    }
  }, [initialData, navigate])

  const [formData, setFormData] = useState(initialData || {
    msrp: '',
    make: 'Toyota',
    model: '',
    year: '2026',
    color: '',
    creditScore: '',
    income: '',
    downPayment: '',
    tradeInValue: '',
    planType: 'loan',
    termLength: '60'
  })

  const [paymentCalculations, setPaymentCalculations] = useState({})

  // Console log every time formData changes
  useEffect(() => {
    console.log('Form data updated:', formData)
    calculatePayments()
  }, [formData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculatePayments = () => {
    const msrp = parseFloat(formData.msrp) || 0
    const downPayment = parseFloat(formData.downPayment) || 0
    const tradeInValue = parseFloat(formData.tradeInValue) || 0
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
    const income = parseFloat(formData.income) || 0
    const monthlyPayment = parseFloat(paymentCalculations.monthlyPayment) || 0
    
    const tips = []
    
    if (creditScore < 670) {
      tips.push("💡 Consider improving your credit score for better rates")
    }
    
    if (income > 0 && (monthlyPayment * 12) / income > 0.2) {
      tips.push("⚠️ Payment may be high relative to income (>20%)")
    }
    
    if (parseFloat(formData.downPayment) < parseFloat(formData.msrp) * 0.2) {
      tips.push("💰 Consider a larger down payment to reduce monthly costs")
    }
    
    if (formData.planType === 'loan' && parseInt(formData.termLength) > 60) {
      tips.push("📅 Shorter loan terms save money on interest")
    }
    
    return tips
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
        <h2>Your {formData.model || 'Toyota RAV4'}</h2>
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

      <div className="results-layout">
        {/* Payment Results Section */}
        <div className="results-section">
          <h2>Payment Calculations</h2>
          
          <div className="payment-summary">
            <div className="payment-card primary">
              <h3>Monthly Payment</h3>
              <div className="payment-amount">${paymentCalculations.monthlyPayment}</div>
              <small>{formData.planType === 'loan' ? 'Loan Payment' : 'Lease Payment'}</small>
            </div>
            
            <div className="payment-details">
              <div className="detail-item">
                <span>Vehicle Price:</span>
                <span>${parseFloat(formData.msrp).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>Taxes & Fees (Est.):</span>
                <span>${parseFloat(paymentCalculations.taxesAndFees || 0).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>Down Payment:</span>
                <span>${parseFloat(formData.downPayment).toLocaleString()}</span>
              </div>
              {formData.tradeInValue && (
                <div className="detail-item">
                  <span>Trade-in Value:</span>
                  <span>${parseFloat(formData.tradeInValue).toLocaleString()}</span>
                </div>
              )}
              <div className="detail-item">
                <span>{formData.planType === 'loan' ? 'Loan' : 'Lease'} Amount:</span>
                <span>${parseFloat(paymentCalculations.loanAmount).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span>Interest Rate:</span>
                <span>{paymentCalculations.interestRate}% APR</span>
              </div>
              <div className="detail-item">
                <span>Term:</span>
                <span>{formData.termLength} months</span>
              </div>
              <div className="detail-item total">
                <span>Total Cost:</span>
                <span>${parseFloat(paymentCalculations.totalCost).toLocaleString()}</span>
              </div>
              {formData.planType === 'loan' ? (
                <div className="detail-item">
                  <span>Total Interest:</span>
                  <span>${parseFloat(paymentCalculations.totalInterest).toLocaleString()}</span>
                </div>
              ) : (
                <div className="detail-item">
                  <span>Residual Value:</span>
                  <span>${parseFloat(paymentCalculations.residualValue).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Tips */}
          <div className="tips-section">
            <h3>Financial Tips</h3>
            <div className="tips-list">
              {getFinancingTips().map((tip, index) => (
                <div key={index} className="tip-item">{tip}</div>
              ))}
              {getFinancingTips().length === 0 && (
                <div className="tip-item">✅ Your financing looks good!</div>
              )}
            </div>
          </div>
        </div>

        {/* Editable Form Section */}
        <div className="edit-section">
          <h2>Adjust Your Information</h2>
          
          <div className="edit-form">
            {/* Vehicle Information */}
            <div className="edit-group">
              <h4>Vehicle Information</h4>
              <div className="input-row">
                <div className="input-group">
                  <label>Model:</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="input-group">
                  <label>MSRP ($):</label>
                  <input
                    type="number"
                    name="msrp"
                    value={formData.msrp}
                    onChange={handleInputChange}
                  />
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
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleInputChange}
                    placeholder="50000"
                  />
                  <small>Helps provide better financing tips</small>
                </div>
              </div>
            </div>

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
                    max={formData.msrp || 50000}
                    step="500"
                    className="form-slider"
                  />
                  <span className="slider-label">${parseInt(formData.msrp || 50000).toLocaleString()}</span>
                </div>
                <small>Max: Vehicle MSRP (${parseInt(formData.msrp || 50000).toLocaleString()})</small>
              </div>

              {/* Trade-in Value Input */}
              <div className="input-row">
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
            </div>

            {/* Plan Preferences */}
            <div className="edit-group">
              <h4>Plan Preferences</h4>
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
            </div>
          </div>
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