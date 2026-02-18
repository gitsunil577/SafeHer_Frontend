import React from 'react';
import { Link } from 'react-router-dom';
import Chatbot from '../components/common/Chatbot';

const Home = () => {
  const features = [
    {
      icon: '🆘',
      title: 'One-Click SOS',
      description: 'Instantly send emergency alerts to nearby volunteers and your trusted contacts with just one tap.'
    },
    {
      icon: '📍',
      title: 'Real-Time Location',
      description: 'Share your live location with responders and emergency contacts during emergencies.'
    },
    {
      icon: '🤝',
      title: 'Verified Volunteers',
      description: 'Connect with a network of verified volunteers ready to assist you in times of need.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected. We prioritize your privacy and security.'
    },
    {
      icon: '📱',
      title: 'Panic-Friendly UI',
      description: 'Designed for ease of use during stressful situations with minimal interaction required.'
    },
    {
      icon: '📊',
      title: 'Incident Tracking',
      description: 'Track and review your alert history. Every incident is documented for your records.'
    }
  ];

  const steps = [
    { number: '1', title: 'Register', description: 'Create your account and complete your safety profile' },
    { number: '2', title: 'Add Contacts', description: 'Add trusted emergency contacts who will be notified' },
    { number: '3', title: 'Stay Protected', description: 'In emergency, tap SOS to alert volunteers and contacts' },
    { number: '4', title: 'Get Help', description: 'Nearby responders will be dispatched to assist you' }
  ];

  const stats = [
    { number: '10,000+', label: 'Users Protected' },
    { number: '500+', label: 'Verified Volunteers' },
    { number: '2,500+', label: 'Incidents Resolved' },
    { number: '< 5 min', label: 'Avg Response Time' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Your Safety, Our Priority</h1>
          <p>
            Instant emergency assistance at your fingertips. Connect with verified volunteers
            and authorities when you need help the most.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: '#e91e63' }}>
              Get Started Free
            </Link>
            <Link to="/volunteer/register" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'white', padding: '40px 0' }}>
        <div className="container">
          <div className="home-stats-grid">
            {stats.map((stat, index) => (
              <div key={index}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e91e63' }}>{stat.number}</div>
                <div style={{ color: '#666' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Why Choose SafeHer?</h2>
            <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              We provide comprehensive safety features designed specifically for women's security and peace of mind.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ background: 'white', padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>How It Works</h2>
            <p style={{ color: '#666' }}>Get protected in 4 simple steps</p>
          </div>

          <div className="home-steps-grid">
            {steps.map((step, index) => (
              <div key={index} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e91e63, #7c4dff)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 20px'
                }}>
                  {step.number}
                </div>
                <h3 style={{ marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: '#666' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #e91e63, #7c4dff)',
        padding: '80px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Ready to Feel Safer?</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 30px', opacity: 0.9 }}>
            Join thousands of women who trust SafeHer for their safety. Registration is free and takes less than a minute.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: '#e91e63' }}>
              Register Now
            </Link>
            <Link to="/login" className="btn btn-lg btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="card" style={{ background: 'linear-gradient(135deg, #e8f5e9, #f3e5f5)' }}>
            <div className="home-volunteer-grid">
              <div>
                <h2 style={{ marginBottom: '20px' }}>Want to Make a Difference?</h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Join our network of verified volunteers and help create a safer community for women.
                  Your presence can make a life-changing difference in someone's moment of need.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                  <li style={{ marginBottom: '10px' }}>✅ Get verified and trained</li>
                  <li style={{ marginBottom: '10px' }}>✅ Receive alerts for nearby emergencies</li>
                  <li style={{ marginBottom: '10px' }}>✅ Help those in need</li>
                  <li>✅ Earn recognition and badges</li>
                </ul>
                <Link to="/volunteer/register" className="btn btn-secondary btn-lg">
                  Become a Volunteer
                </Link>
              </div>
              <div style={{ textAlign: 'center', fontSize: '8rem' }}>
                🤝
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Numbers */}
      <section style={{ background: '#ffebee', padding: '40px 0' }}>
        <div className="container">
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#c62828' }}>Emergency Helpline Numbers</h3>
          <div className="home-stats-grid">
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c62828' }}>112</div>
              <div>Emergency (All)</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c62828' }}>1091</div>
              <div>Women Helpline</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c62828' }}>100</div>
              <div>Police</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c62828' }}>102</div>
              <div>Ambulance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;
