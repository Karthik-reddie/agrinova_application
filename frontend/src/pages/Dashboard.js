import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../App';
import { Cloud, Droplets, Wind, AlertTriangle, ArrowRight, Sun, ThermometerSun, Eye, X, MapPin } from 'lucide-react';

const Dashboard = ({ username }) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [user, setUser] = useState(null);
  const addToast = useToast();
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Low Soil Moisture', desc: 'Consider irrigating sector 4 this evening.', type: 'warning' },
    { id: 2, title: 'Weather Warning', desc: '70% chance of rain tomorrow. Postpone pesticide application.', type: 'danger' }
  ]);
  
  useEffect(() => {
    const saved = localStorage.getItem('agrinova_user');
    if (saved) setUser(JSON.parse(saved));

    axios.get('http://localhost:8000/weather')
      .then(res => setWeather(res.data))
      .catch(err => console.error("Error fetching weather", err));
  }, []);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
    addToast('Alert dismissed safely', 'success');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      <header className="m-bot-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome, {user?.name || 'Farmer'}</h1>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <MapPin size={16} color="var(--primary)" /> 
            {user?.location || 'Hyderabad, TS'} • {user?.acres || 5} Acres ({user?.soilType || 'Loamy'})
          </p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 600 }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </header>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Weather Card */}
        <div className="glass-card weather-card btn" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-main)', cursor: 'pointer', background: 'linear-gradient(135deg, var(--surface) 0%, rgba(46, 125, 50, 0.05) 100%)', border: '1px solid rgba(46, 125, 50, 0.1)', width: '100%', marginBottom: '1rem' }} onClick={() => navigate('/weather')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={16} /> Hyderabad, Telangana
              </p>
              <h2 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px' }}>{weather ? weather.current.temp : '--'}°C</h2>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.25rem' }}>{weather ? weather.current.condition : 'Loading...'}</p>
            </div>
            <Sun size={64} color="var(--warning)" style={{ filter: 'drop-shadow(0 4px 8px rgba(255,193,7,0.3))' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%', background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '16px', justifyContent: 'space-around', backdropFilter: 'blur(10px)' }}>
            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <Droplets size={22} color="var(--info)" />
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{weather ? weather.current.humidity : '--'}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Humidity</div>
            </div>
            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <Wind size={22} color="var(--text-muted)" />
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{weather ? weather.current.wind : '--'} km/h</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Wind</div>
            </div>
          </div>
        </div>

        {/* Alerts Card */}
        {alerts.length > 0 && (
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, white 0%, var(--danger-light) 100%)', borderColor: 'transparent', boxShadow: '0 8px 16px rgba(220, 53, 69, 0.05)', animation: 'fadeIn 0.5s ease-out', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--danger)', fontWeight: 700, fontSize: '1.125rem' }}>
              <div style={{ background: 'rgba(220, 53, 69, 0.1)', padding: '8px', borderRadius: '50%' }}>
                <AlertTriangle size={20} />
              </div>
              <span>Smart Alerts</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.map(alert => (
                <li key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--surface)', padding: '1rem', borderRadius: '16px', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', borderLeft: `4px solid var(--${alert.type})` }}>
                  <div>
                    <strong>{alert.title}:</strong> {alert.desc}
                  </div>
                  <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer', padding: '2px', marginLeft: '0.5rem' }} onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Cards */}
        <div className="glass-card btn" onClick={() => navigate('/crop-recommendation')} style={{ cursor: 'pointer', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid var(--primary-light)', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '16px' }}>
              <ThermometerSun size={24} color="var(--primary)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-main)', fontSize: '1.125rem', fontWeight: 600 }}>Crop Recommendations</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Get AI suggestions based on your soil</p>
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            <ArrowRight size={20} />
          </div>
        </div>
        
        <div className="glass-card btn" onClick={() => navigate('/detect')} style={{ cursor: 'pointer', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid var(--info-light)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--info-light)', padding: '12px', borderRadius: '16px' }}>
              <Eye size={24} color="#0277bd" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-main)', fontSize: '1.125rem', fontWeight: 600 }}>Disease Detection</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Scan crops for early diagnosis</p>
            </div>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
