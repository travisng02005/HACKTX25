import { useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

function Home() {
  const [hoveredRoad, setHoveredRoad] = useState(null)

  const handleExternalLink = () => {
    window.open('https://www.toyota.com/configurator/', '_blank')
  }

  const roads = [
    {
      id: 'left',
      title: 'PAYMENT PLANNER',
      subtitle: 'I know what I want and how much it costs',
      link: '/vehicle-info',
      isExternal: false
    },
    {
      id: 'middle', 
      title: 'PRICE YOUR RIDE',
      subtitle: 'I know what I want but don\'t know how much it costs',
      link: 'https://www.toyota.com/configurator/',
      isExternal: true
    },
    {
      id: 'right',
      title: 'TOYOTA MATCHMAKER', 
      subtitle: 'I don\'t know what I want and don\'t know how much it costs',
      link: '/matchmaker',
      isExternal: false
    }
  ]

  const handleRoadClick = (road) => {
    if (road.isExternal) {
      window.open(road.link, '_blank')
    }
  }

  return (
    <div className="home-fullscreen">
      {/* Title and Tagline */}
      <div className="home-title-section">
        <h1 className="home-main-title">JourneyFi</h1>
        <p className="home-main-tagline">Pick your road to success</p>
      </div>
      
      {/* Interactive Road Navigation - Full Screen */}
      <div className="road-navigation">
        <div className="road-container">
          {/* Base background */}
          <img 
            src="/src/assets/home_screen_no_roads.png" 
            alt="Road Background" 
            className="road-background"
          />
          
          {/* Road image overlays (always visible, emphasized when hovering) */}
          {/* Left road - furthest back */}
          <img 
            src="/src/assets/home_screen_left_road.png" 
            alt="Payment Planner Road"
            className={`road-image-overlay road-layer-left ${hoveredRoad === 'left' ? 'emphasized' : ''}`}
          />
          
          {/* Right road - second layer */}
          <img 
            src="/src/assets/home_screen_right_road.png" 
            alt="Toyota Matchmaker Road"
            className={`road-image-overlay road-layer-right ${hoveredRoad === 'right' ? 'emphasized' : ''}`}
          />
          
          {/* Middle road - third layer */}
          <img 
            src="/src/assets/home_screen_middle_road.png" 
            alt="Price Your Ride Road"
            className={`road-image-overlay road-layer-middle ${hoveredRoad === 'middle' ? 'emphasized' : ''}`}
          />
          
          {/* Interactive hover zones */}
          {roads.map((road) => (
            <div key={road.id}>
              {/* Hover zone */}
              {road.isExternal ? (
                <div
                  className={`road-overlay road-${road.id}`}
                  onMouseEnter={() => setHoveredRoad(road.id)}
                  onMouseLeave={() => setHoveredRoad(null)}
                  onClick={() => handleRoadClick(road)}
                />
              ) : (
                <Link to={road.link} className="road-link">
                  <div
                    className={`road-overlay road-${road.id}`}
                    onMouseEnter={() => setHoveredRoad(road.id)}
                    onMouseLeave={() => setHoveredRoad(null)}
                  />
                </Link>
              )}
              
              {/* Hover text overlay */}
              {hoveredRoad === road.id && (
                <div className={`road-tooltip road-tooltip-${road.id}`}>
                  <div className="tooltip-title">{road.title}</div>
                  <div className="tooltip-subtitle">{road.subtitle}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Car image positioned on the road */}
        <div className="car-container-road">
          <img src="/src/assets/3_4th RAV4 1.png" alt="Toyota RAV4" className="home-car-image-road" />
        </div>
      </div>
    </div>
  )
}

export default Home