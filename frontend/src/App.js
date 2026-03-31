import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import Weather from './pages/Weather';
import DiseaseDetection from './pages/DiseaseDetection';
import Market from './pages/Market';
import Chat from './pages/Chat';
import './App.css';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return children;
};

const Layout = ({ children, username, onLogout }) => {
  const location = useLocation();
  const hideNav = location.pathname === '/' || location.pathname === '/auth';

  if (hideNav) return children;

  return (
    <div className="app-wrapper animate-fade-in">
      <div className="main-content">
        <Header username={username} onLogout={onLogout} />
        <div style={{ padding: '0 0.5rem' }}>
          {children}
        </div>
        <Navigation />
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('agrinova_token');
    if (token) {
      setIsAuthenticated(true);
      const user = JSON.parse(localStorage.getItem('agrinova_user'));
      setUsername(user?.name || 'Farmer');
    }
    
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUsername(user.name);
    addToast('Welcome back!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    setIsAuthenticated(false);
    setUsername('');
    addToast('Logged out successfully');
  };

  return (
    <ToastContext.Provider value={addToast}>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={18} color="var(--primary)" /> : <AlertCircle size={18} color="var(--danger)" />}
            {t.message}
          </div>
        ))}
      </div>
      <Router>
        <Layout username={username} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!isAuthenticated ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard username={username} /></ProtectedRoute>} />
            <Route path="/crop-recommendation" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CropRecommendation /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Weather /></ProtectedRoute>} />
            <Route path="/detect" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DiseaseDetection /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Market /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Chat /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </ToastContext.Provider>
  );
}

export default App;
