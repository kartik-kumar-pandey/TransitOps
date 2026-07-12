import React, { useState, useEffect } from 'react';
import './KpiStrip.css';

// Ease-out curve for the counter animation
const easeOutExpo = (t) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

const AnimatedNumber = ({ value, duration = 800, delay = 0, isPercent = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const update = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (elapsed < delay) {
        // Wait for the staggered delay before starting
        animationFrame = requestAnimationFrame(update);
        return;
      }

      // Calculate progress between 0 and 1
      const progress = Math.min((elapsed - delay) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, delay]);

  return <>{count}{isPercent ? '%' : ''}</>;
};

const KpiStrip = () => {
  // Hardcoded sample data based on requested metrics and statuses
  const metrics = [
    { label: 'Active Vehicles', value: 124, color: 'ink' },
    { label: 'Available Vehicles', value: 42, color: 'teal' },
    { label: 'Vehicles in Maintenance', value: 8, color: 'coral' },
    { label: 'Active Trips', value: 87, color: 'ink' },
    { label: 'Pending Trips', value: 12, color: 'ink' },
    { label: 'Drivers On Duty', value: 105, color: 'ink' },
    { label: 'Fleet Utilization', value: 78, color: 'ink', isPercent: true },
  ];

  return (
    <div className="kpi-strip-wrapper">
      <div className="kpi-strip">
        {metrics.map((metric, index) => (
          <div key={index} className="kpi-segment">
            <div className={`kpi-value kpi-color-${metric.color}`}>
              <AnimatedNumber 
                value={metric.value} 
                delay={index * 60} 
                isPercent={metric.isPercent} 
              />
            </div>
            <div className="kpi-label">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KpiStrip;
