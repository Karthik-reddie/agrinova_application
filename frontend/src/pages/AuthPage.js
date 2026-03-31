import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', location: '', soilType: 'Loamy', acres: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate auth
    const user = { 
      name: formData.name || 'User', 
      email: formData.email,
      location: formData.location || 'Hyderabad, India',
      soilType: formData.soilType || 'Loamy',
      acres: formData.acres ? parseFloat(formData.acres) : 5
    };
    localStorage.setItem('agrinova_token', 'mock-jwt-token-123');
    localStorage.setItem('agrinova_user', JSON.stringify(user));
    
    onLogin(user);
    navigate('/dashboard');
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--surface) 100%)'
    }} className="animate-fade-in">
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', margin: '2rem' }}>
        <div className="text-center m-bot-4">
          <h1 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>🌱 AGRINOVA</h1>
          <p className="text-muted">{isLogin ? 'Welcome back!' : 'Create an account to continue'}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid gap-2 m-bot-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="input-field" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Location (City)</label>
                <input 
                  type="text" 
                  name="location"
                  className="input-field" 
                  placeholder="e.g. Hyderabad"
                  value={formData.location}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Farm Size (Acres)</label>
                <input 
                  type="number" 
                  name="acres"
                  min="0.1" step="0.1"
                  className="input-field" 
                  placeholder="e.g. 5.5"
                  value={formData.acres}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Primary Soil Type</label>
                <select 
                  name="soilType"
                  className="input-field"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Loamy">Loamy - Balanced</option>
                  <option value="Clay">Clay - Heavy, Nutrient-Rich</option>
                  <option value="Sandy">Sandy - Fast Draining</option>
                  <option value="Peaty">Peaty - High Organic</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              placeholder="farmer@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="input-group m-bot-4">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="input-field" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full m-bot-4">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center" style={{ fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
