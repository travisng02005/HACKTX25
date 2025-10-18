import { Link } from 'react-router-dom'
import './App.css'

function SecondPage() {
  return (
    <div className="container">
      <h1>Second Page</h1>
      <p>Welcome to the second page of the website!</p>
      <Link to="/">
        <button className="nav-button">Back to Home</button>
      </Link>
    </div>
  )
}

export default SecondPage