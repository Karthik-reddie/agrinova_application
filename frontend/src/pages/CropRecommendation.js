import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, Sun, CloudRain, Snowflake, Settings, ChevronDown } from 'lucide-react';
import { useToast } from '../App';

const CropRecommendation = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [season, setSeason] = useState('Spring');
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [filterTag, setFilterTag] = useState('All');
  const [sortMode, setSortMode] = useState('Success Rate');
  
  const addToast = useToast();

  const [formData, setFormData] = useState({
    N: 90, P: 42, K: 43,
    temperature: 20.8,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.9,
    soilType: 'Loamy'
  });

  useEffect(() => {
    const saved = localStorage.getItem('agrinova_user');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      if (parsedUser.soilType) {
        setFormData(prev => ({ ...prev, soilType: parsedUser.soilType }));
      }
    }
  }, []);

  const seasons = [
    { name: 'Spring', icon: <Leaf size={24} color={season === 'Spring' ? 'var(--primary)' : 'var(--secondary)'} /> },
    { name: 'Summer', icon: <Sun size={24} color={season === 'Summer' ? 'var(--warning)' : 'var(--warning-light)'} /> },
    { name: 'Rainy', icon: <CloudRain size={24} color={season === 'Rainy' ? 'var(--info)' : 'var(--info-light)'} /> },
    { name: 'Winter', icon: <Snowflake size={24} color={season === 'Winter' ? '#3498db' : '#cceeff'} /> },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.type === 'number' || e.target.type === 'range' ? parseFloat(e.target.value) || 0 : e.target.value });
  };

  const getFilteredResults = () => {
    if (!results) return [];
    let list = [...results];
    if (filterTag !== 'All') {
      list = list.filter(r => r.type === filterTag);
    }
    
    // Sort logic
    if (sortMode === 'Success Rate') {
      list = list.sort((a,b) => b.success_rate - a.success_rate);
    } else if (sortMode === 'Speed') {
      list = list.sort((a,b) => parseInt(a.duration) - parseInt(b.duration));
    }
    return list;
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/predict-crop', formData);
      setResults(res.data.recommendations);
      
      const history = JSON.parse(localStorage.getItem('agrinova_history') || '[]');
      history.unshift({ date: new Date().toISOString(), result: res.data.recommendations[0].crop, inputs: formData });
      localStorage.setItem('agrinova_history', JSON.stringify(history.slice(0, 10)));
      addToast('Analysis complete: Recommendations updated', 'success');
      
    } catch (err) {
      console.error(err);
      addToast('Failed to connect to recommendation engine', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '1rem', paddingBottom: '6rem' }}>
      <header className="m-bot-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '16px' }}>
          <Leaf color="var(--primary)" size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Crop Recommendations</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Personalized suggestions for your farm</p>
        </div>
      </header>

      <div className="m-bot-6">
        <h3 className="m-bot-2" style={{ fontSize: '1rem', fontWeight: 600 }}>Select Season</h3>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {seasons.map(s => (
            <div 
              key={s.name} 
              onClick={() => { setSeason(s.name); addToast(`${s.name} selected`, 'success'); }}
              style={{
                flex: '1', minWidth: '85px',
                padding: '1rem 0.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                border: season === s.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '20px', background: 'var(--surface)',
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: season === s.name ? '0 4px 12px rgba(33, 131, 66, 0.1)' : 'none',
                transform: season === s.name ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ background: season === s.name ? 'var(--primary-light)' : 'var(--background)', padding: '0.75rem', borderRadius: '16px', transition: 'all 0.2s' }}>
                {s.icon}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: season === s.name ? 600 : 500, color: season === s.name ? 'var(--text-main)' : 'var(--text-muted)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card m-bot-6" style={{ padding: '1.25rem' }}>
        <h3 className="m-bot-4" style={{ fontSize: '1rem', fontWeight: 600 }}>Soil Conditions</h3>
        
        <div className="m-bot-4">
          <label className="input-label">Soil Type</label>
          <div style={{ position: 'relative' }}>
            <select 
              name="soilType" 
              value={formData.soilType} 
              onChange={handleInputChange} 
              className="input-field" 
              style={{ fontWeight: 500, cursor: 'pointer' }}
            >
              <option value="Loamy">Loamy — Balanced, ideal for most crops</option>
              <option value="Clay">Clay — High water retention, rich in nutrients</option>
              <option value="Sandy">Sandy — Good drainage, warms up quickly</option>
              <option value="Peaty">Peaty — High organic matter, good moisture</option>
            </select>
            <ChevronDown size={20} color="var(--text-muted)" style={{ position: 'absolute', right: '1rem', top: '16px', pointerEvents: 'none' }} />
          </div>
        </div>

        <div className="m-bot-4">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Soil pH</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formData.ph}</span>
          </label>
          <input 
            type="range" min="0" max="14" step="0.1" 
            name="ph" value={formData.ph} onChange={handleInputChange} 
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px', background: 'linear-gradient(90deg, #1e8b34 30%, #5cd65c 50%, #3498db 80%)', borderRadius: '4px', WebkitAppearance: 'none' }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>Acidic (3.0)</span><span>Neutral (7.0)</span><span>Alkaline (10.0)</span>
          </div>
        </div>

        <button 
          className="btn btn-outline w-full m-bot-4" 
          onClick={() => setExpandedSettings(!expandedSettings)}
          style={{ justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.875rem', borderRadius: '12px' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><Settings size={18} /> Advanced Soil Data</span>
          <ChevronDown size={18} style={{ transform: expandedSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {expandedSettings && (
          <div className="grid gap-2 m-bot-4 animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
            {['N', 'P', 'K'].map(nutrient => (
              <div key={nutrient}>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>{nutrient} Value</label>
                <input type="number" name={nutrient} value={formData[nutrient]} onChange={handleInputChange} className="input-field" style={{ padding: '0.75rem' }} />
              </div>
            ))}
            <div>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>Rainfall (mm)</label>
              <input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} className="input-field" style={{ padding: '0.75rem' }} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>Temp (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="input-field" style={{ padding: '0.75rem' }} />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="input-field" style={{ padding: '0.75rem' }} />
            </div>
          </div>
        )}

        {/* Custom recommend button style */}
        {!results && (
          <button className="btn btn-primary w-full" onClick={handlePredict} disabled={loading} style={{ padding: '1rem', fontSize: '1rem', fontWeight: 600, borderRadius: '16px' }}>
            {loading ? 'Analyzing data...' : 'Get Recommendations'}
          </button>
        )}
      </div>

      {results && (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recommended for {season}</h3>
            <div className="btn" onClick={() => setSortMode(sortMode === 'Success Rate' ? 'Speed' : 'Success Rate')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              {sortMode} <ChevronDown size={16} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', marginBottom: '0.5rem' }}>
            {['All', 'Vegetable', 'Cereal', 'Fruit', 'Legume'].map(tag => (
              <div 
                key={tag} 
                onClick={() => setFilterTag(tag)}
                className={`pill ${filterTag === tag ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {tag}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {getFilteredResults().length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No {filterTag.toLowerCase()}s found for this environment.</div>
            ) : getFilteredResults().map((res, i) => (
              <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', margin: 0, cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} onClick={() => addToast(`Viewing full guide for ${res.crop}...`, 'success')}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '16px', background: 'var(--background)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0
                }}>
                  {res.crop === 'Banana' ? '🍌' : res.crop === 'Mango' ? '🥭' : res.crop === 'Grapes' ? '🍇' : res.crop === 'Apple' ? '🍎' : res.crop === 'Watermelon' ? '🍉' : res.crop === 'Cotton' ? '☁️' : '🌿'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{res.crop}</h4>
                      <span style={{ fontSize: '0.75rem', background: 'var(--background)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 500 }}>
                        {res.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{res.duration.split(' ')[0]} d</div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Success</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{res.success_rate}%</span>
                  </div>
                  
                  <div className="progress-container">
                    <div className="progress-fill" style={{ width: `${res.success_rate}%`, background: 'linear-gradient(90deg, var(--primary) 0%, #3498db 100%)' }}></div>
                  </div>
                </div>
                <ChevronDown size={20} color="var(--border)" style={{ transform: 'rotate(-90deg)' }} />
              </div>
            ))}
          </div>
          
          <button className="btn btn-outline w-full" style={{ marginTop: '1.5rem', fontWeight: 'bold' }} onClick={handlePredict}>{loading ? 'Re-analyzing' : 'Recalculate Models'}</button>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
