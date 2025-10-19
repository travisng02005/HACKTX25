import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'

function PlanSummary() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get plan data from navigation state or redirect if none
  const planData = location.state?.planData
  const vehicleData = location.state?.vehicleData
  
  useEffect(() => {
    if (!planData || !vehicleData) {
      navigate('/payment-results')
    }
  }, [planData, vehicleData, navigate])

  // Add gradient background class
  useEffect(() => {
    document.body.classList.add('payment-results-page')
    return () => {
      document.body.classList.remove('payment-results-page')
    }
  }, [])

  const generatePDF = async () => {
    const element = document.getElementById('plan-summary-content')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = `Toyota_${vehicleData.model}_Payment_Plan.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  if (!planData || !vehicleData) {
    return <div>Loading...</div>
  }

  return (
    <div 
      className="plan-summary-container"
      style={{
        backgroundImage: 'url(/save_plan_bg.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}
    >
      <div className="plan-summary-overlay">
        <div className="container plan-summary-content" id="plan-summary-content">
          <h1>Your Toyota Payment Plan</h1>

          {/* Main Content Grid */}
          <div className="plan-summary-grid">
            {/* Left Column: Vehicle & Financial Info */}
            <div className="info-column">
              {/* Vehicle Information */}
              <div className="summary-section compact">
                <h3>Vehicle Details</h3>
                <div className="compact-grid">
                  <div className="compact-item">
                    <span className="label">Vehicle:</span>
                    <span className="value">
                      {vehicleData.year} {vehicleData.make} {vehicleData.model}
                      {vehicleData.trim && ` ${vehicleData.trim}`}
                    </span>
                  </div>
                  <div className="compact-item">
                    <span className="label">MSRP:</span>
                    <span className="value">${parseInt(vehicleData.msrp || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="summary-section compact">
                <h3>Financial Summary</h3>
                <div className="compact-grid">
                  <div className="compact-item">
                    <span className="label">Down Payment:</span>
                    <span className="value">${parseInt(vehicleData.downPayment || 0).toLocaleString()}</span>
                  </div>
                  {vehicleData.tradeInValue && (
                    <div className="compact-item">
                      <span className="label">Trade-in:</span>
                      <span className="value">${parseInt(vehicleData.tradeInValue).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="compact-item">
                    <span className="label">Credit Score:</span>
                    <span className="value">{vehicleData.creditScore || 700}</span>
                  </div>
                  {vehicleData.income && (
                    <div className="compact-item">
                      <span className="label">Annual Income:</span>
                      <span className="value">${parseInt(vehicleData.income).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Selected Plan */}
            <div className="plan-column">
              <div className="plan-highlight-compact">
                <h2>Selected {planData.planType === 'loan' ? 'Financing' : 'Lease'} Plan</h2>
                <div className="monthly-payment-compact">
                  <span className="amount">${parseFloat(planData.monthlyPayment).toLocaleString()}</span>
                  <span className="period">/month</span>
                </div>
                <div className="plan-details-compact">
                  <div className="detail-item">
                    <span>{planData.termLength} months</span>
                    <span>{planData.interestRate}% {planData.planType === 'loan' ? 'APR' : 'Money Factor'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Total Cost: ${parseFloat(planData.totalCost).toLocaleString()}</span>
                    {planData.planType === 'loan' && (
                      <span>Interest: ${parseFloat(planData.totalInterest).toLocaleString()}</span>
                    )}
                    {planData.annualMileage && (
                      <span>Mileage: {parseInt(planData.annualMileage).toLocaleString()} mi/yr</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-compact">
            <button onClick={generatePDF} className="pdf-button-compact">
              📄 Save as PDF
            </button>
            <Link to="/payment-results" state={{ formData: vehicleData }}>
              <button className="nav-button-compact">← Back to Options</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanSummary