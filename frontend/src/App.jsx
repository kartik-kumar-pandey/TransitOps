import { useState } from 'react'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🚍</span>
          TransitOps
        </div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      
      <main className="main-content">
        <section className="hero">
          <div className="hero-text">
            <div className="badge">Next-Gen Fleet Management</div>
            <h1>Smart Transport<br />Operations Platform</h1>
            <p>Optimize routes, monitor vehicle health, and manage your drivers in real-time with our cutting-edge AI-driven platform.</p>
            <div className="cta-group">
              <button 
                className="btn-primary"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Get Started {isHovered ? '🚀' : '→'}
              </button>
              <button className="btn-secondary">View Demo</button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="glass-card stat-card card-1">
              <div className="stat-value">98%</div>
              <div className="stat-label">On-time Arrivals</div>
            </div>
            <div className="glass-card stat-card card-2">
              <div className="stat-value">12k+</div>
              <div className="stat-label">Active Vehicles</div>
            </div>
            <div className="glass-card stat-card card-3">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Live Monitoring</div>
            </div>
            <div className="glow-orb"></div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
