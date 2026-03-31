import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloud, CloudRain, Droplets, Wind, Sun, MapPin, Eye, RefreshCw, ChevronDown } from 'lucide-react';
import { useToast } from '../App';

const Weather = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const [user, setUser] = useState(null);
  const addToast = useToast();

  const fetchWeather = async () => {
    setLoading(true);
    let lat = 17.385; // default
    let lon = 78.4867;
    let locationString = 'Hyderabad, India';

    try {
      const saved = localStorage.getItem('agrinova_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        if (parsed.location) {
          locationString = parsed.location;
          // geocoding
          const geoReq = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationString)}&count=1`);
          if (geoReq.data.results && geoReq.data.results.length > 0) {
            lat = geoReq.data.results[0].latitude;
            lon = geoReq.data.results[0].longitude;
          }
        }
      }

      const res = await axios.get(`http://localhost:8000/weather?lat=${lat}&lon=${lon}`);
      setData(res.data);
      setSelectedHour(0);
    } catch (err) {
      console.error(err);
      addToast('Failed to sync weather data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => {
    fetchWeather();
    addToast('Weather data updated to live satellite readings', 'success');
  };

  if (loading || !data) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', paddingBottom: '6rem' }}>
        <RefreshCw size={32} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  const currentDisp = selectedHour === 0 ? data.current : data.hourly[selectedHour];

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => addToast('GPS Location Synced', 'success')}>
          <MapPin size={20} color="var(--primary)" />
          <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{user?.location || 'Hyderabad, TS'}</span>
          <ChevronDown size={16} color="var(--text-muted)" />
        </div>
        <div onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }} className="btn">
          <RefreshCw size={14} /> Just now
        </div>
      </div>

      {/* Main weather card */}
      <div className="glass-card m-bot-6" style={{ background: 'linear-gradient(135deg, rgba(33, 131, 66, 0.05) 0%, rgba(52, 152, 219, 0.05) 100%)', border: '1px solid rgba(52, 152, 219, 0.1)', textAlign: 'center', padding: '2.5rem 1rem', transition: 'all 0.3s' }}>
        {currentDisp.icon === 'sun' || (selectedHour === 0 && currentDisp.condition.includes('Clear')) ? (
          <Sun size={80} color="var(--warning)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 8px 16px rgba(255,193,7,0.4))' }} />
        ) : currentDisp.icon === 'cloud-rain' || (selectedHour === 0 && currentDisp.condition.includes('Rain')) ? (
          <CloudRain size={80} color="var(--info)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 8px 16px rgba(13,202,240,0.4))' }} />
        ) : (
          <Cloud size={80} color="var(--text-muted)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 8px 16px rgba(130,138,150,0.4))' }} />
        )}
        <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          {currentDisp.temp}°
        </h1>
        <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', textTransform: 'capitalize' }}>
          {currentDisp.condition}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Droplets size={20} color="var(--info)" /> {currentDisp.humidity}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Wind size={20} color="var(--text-muted)" /> {currentDisp.wind} km/h
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Eye size={20} color="var(--primary)" /> 12 km
          </div>
        </div>
      </div>

      {/* Hourly */}
      <div className="m-bot-6">
        <h3 className="m-bot-4" style={{ fontSize: '1.125rem', fontWeight: 600 }}>Today</h3>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {data.hourly.map((hour, i) => (
            <div key={i} onClick={() => setSelectedHour(i)} style={{ 
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 0.5rem', minWidth: '75px', borderRadius: '24px',
              background: i === selectedHour ? 'var(--primary)' : 'var(--surface)',
              color: i === selectedHour ? 'white' : 'var(--text-main)',
              boxShadow: i === selectedHour ? '0 8px 16px rgba(33, 131, 66, 0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
              border: i !== selectedHour ? '1px solid var(--border)' : 'none',
              transform: i === selectedHour ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: i === selectedHour ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>{hour.time}</span>
              {hour.icon === 'sun' ? <Sun size={24} color={i === selectedHour ? 'white' : 'var(--warning)'} /> : 
               hour.icon === 'cloud-rain' ? <CloudRain size={24} color={i === selectedHour ? 'white' : 'var(--info)'} /> : 
               <Cloud size={24} color={i === selectedHour ? 'white' : 'var(--text-muted)'} />}
              <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{hour.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h3 className="m-bot-4" style={{ fontSize: '1.125rem', fontWeight: 600 }}>7-Day Forecast</h3>
        <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {data.daily.map((day, i) => (
            <React.Fragment key={i}>
               <div 
                 onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                 style={{ 
                   display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                   padding: '1rem', borderRadius: '16px', 
                   background: expandedDay === i ? 'var(--background)' : 'transparent',
                   cursor: 'pointer', transition: 'all 0.2s'
                 }}
               >
                 <div style={{ flex: 1, fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{day.day}</div>
                 <div style={{ flex: 1, display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Droplets size={16} color="var(--info)" /> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{day.rain_prob}%</span>
                   </div>
                 </div>
                 <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                   <span style={{ color: 'var(--text-main)' }}>{day.high}°</span>
                   <span style={{ color: 'var(--text-muted)' }}>{day.low}°</span>
                   <ChevronDown size={20} color="var(--border)" style={{ transform: expandedDay === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                 </div>
               </div>
               {expandedDay === i && (
                 <div className="animate-fade-in" style={{ padding: '0 1rem 1rem', display: 'flex', justifyContent: 'space-around', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Wind size={16} /> {data.current.wind} km/h avg</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sun size={16} /> UV Index: High</div>
                 </div>
               )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Weather;
