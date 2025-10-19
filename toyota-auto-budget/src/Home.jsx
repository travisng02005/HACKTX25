import { Link } from 'react-router-dom'
import './App.css'

function Home() {
  const handleExternalLink = () => {
    window.open('https://www.toyota.com/configurator/', '_blank')
  }

  return (
    <div className="home-fullscreen">
      {/* Red Header */}
      <div className="home-header">
        <h1 className="home-welcome">Welcome to</h1>
        <h2 className="home-title">TOYOTA AUTO BUDGET</h2>
      </div>

      {/* Main Content Area */}
      <div className="home-main">
        {/* Left Side - Car Image and Text */}
        <div className="home-left">
          <div className="car-container">
            <img src="/src/assets/3_4th RAV4 1.png" alt="Toyota RAV4" className="home-car-image" />
          </div>
          <p className="home-tagline">
            Chose the road that<br />
            best suits your need!
          </p>
        </div>

        {/* Right Side - Buttons */}
        <div className="home-right">
          <Link to="/questionnaire" className="home-button-link">
            <div className="home-button">
              <div className="button-title">PAYMENT PLANNER</div>
              <div className="button-subtitle">I know what I want and how much it costs</div>
            </div>
          </Link>

          <div 
            className="home-button" 
            onClick={handleExternalLink}
          >
            <div className="button-title">PRICE YOUR RIDE</div>
            <div className="button-subtitle">I know what I want but don't know how much it costs</div>
          </div>

          <Link to="/matchmaker" className="home-button-link">
            <div className="home-button">
              <div className="button-title">TOYOTA MATCHMAKER</div>
              <div className="button-subtitle">I don't know what I want and don't know how much it costs</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home