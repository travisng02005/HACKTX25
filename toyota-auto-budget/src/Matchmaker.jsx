import { Link } from 'react-router-dom'
import './App.css'

function Matchmaker() {
  return (
    <div className="container">
      <h1>Matchmaker</h1>
      <p>Based on your preferences, we'll match you with the perfect Toyota vehicle!</p>
      <p>Here you can see recommended vehicles, compare features, and explore financing options.</p>
      
      <div className="button-container">
        <Link to="/">
          <button className="nav-button">Back to Home</button>
        </Link>
        <Link to="/questionnaire">
          <button className="nav-button">Go to Questionnaire</button>
        </Link>
      </div>
    </div>
  )
}

export default Matchmaker