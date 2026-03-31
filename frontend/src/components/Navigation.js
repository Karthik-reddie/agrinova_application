import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CloudRain, ScanLine, TrendingUp, MessageSquare } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/weather', label: 'Weather', icon: CloudRain },
  { path: '/detect', label: 'Detect', icon: ScanLine },
  { path: '/market', label: 'Market', icon: TrendingUp },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
];

const Navigation = () => {
  return (
    <>
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active active-bg' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <Icon size={24} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;
