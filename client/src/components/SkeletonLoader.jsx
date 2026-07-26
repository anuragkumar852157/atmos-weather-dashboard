

export const SkeletonLoader = () => {
  return (
    <div className="weather-dashboard">
      <div className="location-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: '30%', margin: '0 auto' }}></div>
      </div>
      
      <div className="current-weather">
        <div className="glass main-card skeleton-card"></div>
        <div className="details-grid">
          <div className="glass detail-item skeleton"></div>
          <div className="glass detail-item skeleton"></div>
          <div className="glass detail-item skeleton"></div>
          <div className="glass detail-item skeleton"></div>
        </div>
      </div>

      <div className="forecast-section">
        <div className="skeleton skeleton-text" style={{ width: '200px', height: '30px', marginBottom: '1.5rem' }}></div>
        <div className="forecast-grid">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="glass forecast-card skeleton-forecast"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
