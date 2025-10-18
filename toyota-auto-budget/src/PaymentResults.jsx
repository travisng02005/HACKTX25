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

    // Calculate interest rate based on credit score
    let interestRate
    if (creditScore >= 800) interestRate = 0.0299 // 2.99%
    else if (creditScore >= 740) interestRate = 0.0399 // 3.99%
    else if (creditScore >= 670) interestRate = 0.0599 // 5.99%
    else if (creditScore >= 580) interestRate = 0.0799 // 7.99%
    else interestRate = 0.1199 // 11.99%

    // Calculate loan amount
    const loanAmount = msrp - downPayment - tradeInValue
    
    if (formData.planType === 'loan') {
      // Loan calculation
      const monthlyRate = interestRate / 12
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termLength)) / 
                            (Math.pow(1 + monthlyRate, termLength) - 1)
      
      const totalCost = monthlyPayment * termLength + downPayment
      const totalInterest = (monthlyPayment * termLength) - loanAmount

      setPaymentCalculations({
        monthlyPayment: monthlyPayment.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        loanAmount: loanAmount.toFixed(2),
        interestRate: (interestRate * 100).toFixed(2)
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
        interestRate: (interestRate * 100).toFixed(2)
      })
    }
  }

  const getCreditScoreRange = (score) => {
    if (score >= 800) return 'Excellent (800+)'
    if (score >= 740) return 'Very Good (740-799)'
    if (score >= 670) return 'Good (670-739)'
    if (score >= 580) return 'Fair (580-669)'
    if (score >= 300) return 'Poor (300-579)'
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
    <div className="container">
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
                  />
                  {formData.creditScore && (
                    <small className="credit-range">
                      {getCreditScoreRange(parseInt(formData.creditScore))}
                    </small>
                  )}
                </div>
                <div className="input-group">
                  <label>Annual Income ($):</label>
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="edit-group">
              <h4>Payment Information</h4>
              <div className="input-row">
                <div className="input-group">
                  <label>Down Payment ($):</label>
                  <input
                    type="number"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="input-group">
                  <label>Trade-in Value ($):</label>
                  <input
                    type="number"
                    name="tradeInValue"
                    value={formData.tradeInValue}
                    onChange={handleInputChange}
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
        <Link to="/questionnaire">
          <button className="nav-button">Back to Questionnaire</button>
        </Link>
        <Link to="/matchmaker" state={{ formData, paymentCalculations }}>
          <button className="nav-button">View Vehicle Matches</button>
        </Link>
        <Link to="/">
          <button className="nav-button">Back to Home</button>
        </Link>
      </div>
    </div>
  )
}

export default PaymentResults