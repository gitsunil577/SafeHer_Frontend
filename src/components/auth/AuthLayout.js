import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      {/* Illustration Panel */}
      <div className="auth-illustration">
        {/* Animated background circles */}
        <div className="auth-bg-shapes">
          <div className="auth-shape auth-shape-1"></div>
          <div className="auth-shape auth-shape-2"></div>
          <div className="auth-shape auth-shape-3"></div>
          <div className="auth-shape auth-shape-4"></div>
        </div>

        <div className="auth-illustration-content">
          {/* Shield + Woman SVG Illustration */}
          <svg
            className="auth-svg"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shield */}
            <path
              d="M200 50 L300 100 L300 220 C300 280 250 340 200 360 C150 340 100 280 100 220 L100 100 Z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="3"
            />
            <path
              d="M200 70 L285 112 L285 218 C285 270 242 322 200 340 C158 322 115 270 115 218 L115 112 Z"
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />

            {/* Woman silhouette inside shield */}
            <circle cx="200" cy="155" r="25" fill="rgba(255,255,255,0.8)" />
            <path
              d="M170 200 C170 185 185 175 200 175 C215 175 230 185 230 200 L230 235 C230 240 226 244 221 244 L179 244 C174 244 170 240 170 235 Z"
              fill="rgba(255,255,255,0.8)"
            />
            {/* Dress/body */}
            <path
              d="M175 244 L165 300 L195 290 L200 310 L205 290 L235 300 L225 244"
              fill="rgba(255,255,255,0.7)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1"
              strokeLinejoin="round"
            />

            {/* Location pin - left */}
            <g transform="translate(60, 180)">
              <path
                d="M20 0 C31 0 40 9 40 20 C40 35 20 50 20 50 C20 50 0 35 0 20 C0 9 9 0 20 0Z"
                fill="rgba(255,255,255,0.5)"
              />
              <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.3)" />
            </g>

            {/* Location pin - right */}
            <g transform="translate(310, 160)">
              <path
                d="M20 0 C31 0 40 9 40 20 C40 35 20 50 20 50 C20 50 0 35 0 20 C0 9 9 0 20 0Z"
                fill="rgba(255,255,255,0.5)"
              />
              <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.3)" />
            </g>

            {/* Connection lines (network) */}
            <line x1="80" y1="200" x2="170" y2="200" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="230" y1="190" x2="330" y2="180" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Heart inside shield top */}
            <path
              d="M200 120 C200 116 195 110 189 110 C183 110 178 116 178 121 C178 130 200 142 200 142 C200 142 222 130 222 121 C222 116 217 110 211 110 C205 110 200 116 200 120Z"
              fill="rgba(255,255,255,0.6)"
            />

            {/* Small stars/sparkles */}
            <g fill="rgba(255,255,255,0.5)">
              <circle cx="130" cy="80" r="3" />
              <circle cx="280" cy="90" r="2.5" />
              <circle cx="90" cy="280" r="2" />
              <circle cx="310" cy="280" r="3" />
              <circle cx="150" cy="340" r="2" />
              <circle cx="260" cy="330" r="2.5" />
              <circle cx="70" cy="140" r="2" />
              <circle cx="340" cy="240" r="2" />
            </g>

            {/* SOS signal waves */}
            <g transform="translate(200, 155)" opacity="0.3">
              <circle cx="0" cy="0" r="60" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" className="auth-wave auth-wave-1" />
              <circle cx="0" cy="0" r="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" className="auth-wave auth-wave-2" />
              <circle cx="0" cy="0" r="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" className="auth-wave auth-wave-3" />
            </g>
          </svg>

          <div className="auth-illustration-text">
            <h2>SafeHer</h2>
            <p>Your safety is our priority. Join a community that stands together to protect and empower women.</p>
            <div className="auth-features-list">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">&#9737;</span>
                <span>Real-time SOS Alerts</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">&#9906;</span>
                <span>Live Location Tracking</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">&#9829;</span>
                <span>Verified Volunteer Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
