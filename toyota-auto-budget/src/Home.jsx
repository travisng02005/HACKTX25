import { Link } from 'react-router-dom'
import './App.css'

function Home() {
  const handleExternalLink = () => {
    window.open('https://www.toyota.com/configurator/', '_blank')
  }

  return (
    <div className="container">
      <h1>Toyota Auto Budget</h1>
      <p>Welcome to your auto budgeting companion! (Updated)</p>
      
      <div className="button-container">
        <Link to="/questionnaire">
          <button className="nav-button">Questionnaire</button>
        </Link>
        
        <Link to="/matchmaker">
          <button className="nav-button">Matchmaker</button>
        </Link>
        
        <button 
          className="nav-button external-button" 
          onClick={handleExternalLink}
        >
          Visit Toyota Website
        </button>
      </div>
    </div>
  )
}

export default Home