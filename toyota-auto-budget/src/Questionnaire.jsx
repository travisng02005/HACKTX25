import { Link } from 'react-router-dom'
import './App.css'

function Questionnaire() {
  return (
    <div className="container">
      <h1>Questionnaire</h1>
      <p>Answer a few questions to help us find the perfect Toyota for you!</p>
      <Link to="/">
        <button className="nav-button">Back to Home</button>
      </Link>
    </div>
  )
}

export default Questionnaire