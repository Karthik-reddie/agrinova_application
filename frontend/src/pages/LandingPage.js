import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Droplets, Sun, Activity } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)'
    }}>
      <header className="container w-full" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand-title">
          <span style={{color: 'var(--primary)'}}>🌱</span> AGRINOVA
        </div>
        <div>
          <button className="btn btn-outline" style={{ marginRight: '1rem' }} onClick={() => navigate('/auth')}>
            Login
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Get Started
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem', lineHeight: 1.1 }}>
            AGRINOVA <br/>
            <span style={{ color: 'var(--text-main)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>Powering Pure Soil</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Smart farming intelligence platform using ML for accurate crop recommendations, real-time weather, and disease detection.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }} onClick={() => navigate('/auth')}>
              Start Farming Smarter
            </button>
          </div>
        </div>

        <div className="grid container" style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginTop: '5rem',
          width: '100%'
        }}>
          {[
            { icon: <Leaf size={32} color="var(--primary)" />, title: 'Crop Recs', desc: 'ML-based crop predictions' },
            { icon: <Sun size={32} color="var(--warning)" />, title: 'Weather API', desc: 'Real-time hyper-local weather alerts' },
            { icon: <Activity size={32} color="var(--danger)" />, title: 'Disease Detect', desc: 'AI-powered crop diagnosis' },
            { icon: <Droplets size={32} color="var(--info)" />, title: 'Market Info', desc: 'Current trends & demand' }
          ].map((feature, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: '50%', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p className="text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
