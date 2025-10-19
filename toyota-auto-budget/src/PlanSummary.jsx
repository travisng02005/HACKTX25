import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import './App.css'

ChartJS.register(ArcElement, Tooltip, Legend)

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

  // Calculate budget breakdown and chart data
  const calculateBudgetBreakdown = () => {
    if (!vehicleData.income || !planData.monthlyPayment) {
      return null
    }

    // Convert annual income to monthly after-tax income (rough estimate: 75% after taxes)
    const annualIncome = parseFloat(vehicleData.income.toString().replace(/,/g, '')) || 0
    const monthlyAfterTaxIncome = (annualIncome * 0.75) / 12

    // Get monthly budget values or use defaults
    const getMonthlyBudget = (budgetField, defaultValue) => {
      const value = vehicleData[budgetField]
      if (value && value !== '') {
        return parseFloat(value.toString().replace(/,/g, ''))
      }
      return defaultValue
    }

    const monthlyBudgets = {
      housing: getMonthlyBudget('housingBudget', 1200),
      food: getMonthlyBudget('foodBudget', 400),
      utilities: getMonthlyBudget('utilitiesBudget', 150),
      other: getMonthlyBudget('otherBudget', 300)
    }

    const totalMonthlyExpenses = Object.values(monthlyBudgets).reduce((sum, val) => sum + val, 0)
    const carPayment = parseFloat(planData.monthlyPayment)
    const totalWithCar = totalMonthlyExpenses + carPayment
    const remainingIncome = monthlyAfterTaxIncome - totalWithCar

    // Check if user has enough income
    if (remainingIncome < 0) {
      return {
        hasEnoughIncome: false,
        deficit: Math.abs(remainingIncome),
        monthlyAfterTaxIncome
      }
    }

    return {
      hasEnoughIncome: true,
      monthlyAfterTaxIncome,
      carPayment,
      totalMonthlyExpenses,
      remainingIncome,
      chartData: {
        labels: ['Car Payment', 'Other Expenses', 'Remaining Income'],
        datasets: [{
          data: [carPayment, totalMonthlyExpenses, remainingIncome],
          backgroundColor: ['#e60012', '#ffffff', '#666666'],
          borderColor: ['#cc0000', '#cccccc', '#444444'],
          borderWidth: 2
        }]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.parsed
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: $${value.toLocaleString()} (${percentage}%)`
              }
            }
          }
        }
      }
    }
  }

  const budgetBreakdown = calculateBudgetBreakdown()

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
            {/* Top Row: Vehicle & Financial Info */}
            <div className="info-row">
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

            {/* Bottom Row: Selected Plan and Budget Chart */}
            <div className="plan-row">
              {/* Selected Plan */}
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

              {/* Budget Breakdown Chart */}
              <div className="budget-chart-section">
                <h3>Monthly Budget Impact</h3>
                {budgetBreakdown ? (
                  budgetBreakdown.hasEnoughIncome ? (
                    <div className="chart-container">
                      <Pie data={budgetBreakdown.chartData} options={budgetBreakdown.chartOptions} />
                      <div className="chart-legend-large">
                        <div className="legend-item">
                          <div className="legend-color red"></div>
                          <span>Car Payment</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color white"></div>
                          <span>Monthly Expenses</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color gray"></div>
                          <span>Remaining</span>
                        </div>
                      </div>
                      <div className="budget-summary">
                        <div className="budget-item">
                          <span>After-tax Income:</span>
                          <span>${budgetBreakdown.monthlyAfterTaxIncome.toLocaleString()}</span>
                        </div>
                        <div className="budget-item remaining">
                          <span>Remaining:</span>
                          <span>${budgetBreakdown.remainingIncome.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="insufficient-income">
                      <p>⚠️ <strong>Insufficient Monthly Income</strong></p>
                      <p>Your estimated monthly expenses exceed your after-tax income by <strong>${budgetBreakdown.deficit.toLocaleString()}</strong>.</p>
                      <p>Consider a longer loan term, higher down payment, or adjusting your budget.</p>
                    </div>
                  )
                ) : (
                  <div className="no-income-data">
                    <p>💡 <strong>Budget Analysis Unavailable</strong></p>
                    <p>Enter your annual income and monthly budget in the previous steps to see your personalized budget breakdown.</p>
                  </div>
                )}
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