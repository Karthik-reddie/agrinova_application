import React, { useState, useEffect } from 'react';
import { Menu, Leaf, Home, Cloud, Activity, TrendingUp, MessageSquare, X, ThermometerSun, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ username, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check initial global theme
    if (document.body.getAttribute('data-theme') === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Crop Recommendations', path: '/crop-recommendation', icon: <ThermometerSun size={20} /> },
    { name: 'Weather Forecast', path: '/weather', icon: <Cloud size={20} /> },
    { name: 'Disease Detection', path: '/detect', icon: <Activity size={20} /> },
    { name: 'Market Trends', path: '/market', icon: <TrendingUp size={20} /> },
    { name: 'AGRINOVA AI', path: '/chat', icon: <MessageSquare size={20} /> }
  ];

  const handleNav = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Off-canvas Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, backdropFilter: 'blur(4px)' }} 
        />
      )}

      {/* Side Drawer */}
      <div 
        style={{ 
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', 
          background: 'var(--surface)', zIndex: 9999, 
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', 
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Leaf size={24} color="var(--primary)" />
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '0.5px' }}>AGRINOVA</span>
          </div>
          <X size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
        </div>
        
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.path} 
                onClick={() => handleNav(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', 
                  padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'background 0.2s, color 0.2s'
                }}
              >
                <div style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</div>
                {item.name}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer' }}
            onClick={() => { setIsOpen(false); onLogout(); }}
          >
            <div className="user-avatar" style={{ background: 'var(--danger-light)', color: 'var(--danger)', fontWeight: 600 }}>
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--danger)' }}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Menu size={24} color="var(--text-main)" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(true)} />
          <div className="brand-title" style={{ gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Leaf size={24} color="var(--primary)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>AGRINOVA</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SMART FARMING ASSISTANT</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            onClick={toggleTheme}
            style={{ 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface)', 
              border: '1px solid var(--border)', transition: 'background 0.2s' 
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--text-muted)" />}
          </div>
          <div 
            className="user-avatar" 
            onClick={onLogout} 
            style={{ cursor: 'pointer', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, border: '1px solid rgba(46, 125, 50, 0.2)' }} 
            title="Logout"
          >
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
