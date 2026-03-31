import React, { useState } from 'react';
import { TrendingUp, Download, Search, ChevronDown, CheckCircle, Leaf } from 'lucide-react';
import { useToast } from '../App';

const Market = () => {
  const [timeframe, setTimeframe] = useState('6m');
  const [search, setSearch] = useState('');
  const [loadingChart, setLoadingChart] = useState(false);
  const [user, setUser] = useState(null);
  
  // New States matches requested UI
  const [category, setCategory] = useState('Cereals');
  const [marketRegion, setMarketRegion] = useState('Local');
  const [quality, setQuality] = useState(5);
  const [sortMode, setSortMode] = useState('Trend');
  const [filterTag, setFilterTag] = useState('All');
  
  const addToast = useToast();

  React.useEffect(() => {
    const saved = localStorage.getItem('agrinova_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleTimeframeChange = (t) => {
    setTimeframe(t);
    setLoadingChart(true);
    setTimeout(() => setLoadingChart(false), 500);
    addToast(`Loading ${t} regional data for ${user?.location || 'your area'}`, 'success');
  };

  const categories = [
    { name: 'Cereals', icon: <TrendingUp size={24} color={category === 'Cereals' ? 'var(--primary)' : 'var(--secondary)'} /> },
    { name: 'Vegetables', icon: <Leaf size={24} color={category === 'Vegetables' ? 'var(--warning)' : 'var(--warning-light)'} /> },
    { name: 'Fruits', icon: <CheckCircle size={24} color={category === 'Fruits' ? 'var(--info)' : 'var(--info-light)'} /> },
    { name: 'Cash Crops', icon: <Search size={24} color={category === 'Cash Crops' ? '#3498db' : '#cceeff'} /> },
  ];

  const modifier = user?.location ? (user.location.length % 5) : 0;
  
  const currentPrices = [
    { name: 'Rice (Paddy)', type: 'Cereal', price: (2203 + modifier * 14 + (quality * 10)).toString(), unit: 'q', trend: '+1.2%', status: 'High Demand' },
    { name: 'Wheat', type: 'Cereal', price: (2275 + modifier * 8 + (quality * 12)).toString(), unit: 'q', trend: '+0.5%', status: 'Stable' },
    { name: 'Cotton', type: 'Cash Crop', price: (6620 - modifier * 25 + (quality * 50)).toString(), unit: 'q', trend: '-2.1%', status: 'Low Demand' },
    { name: 'Maize', type: 'Cereal', price: (2090 + modifier * 11 + (quality * 8)).toString(), unit: 'q', trend: '+0.8%', status: 'Stable' },
    { name: 'Soybean', type: 'Vegetable', price: (4600 - modifier * 18 + (quality * 30)).toString(), unit: 'q', trend: '-1.5%', status: 'Dropping' },
    { name: 'Sugarcane', type: 'Cash Crop', price: (315 + modifier * 2 + (quality * 2)).toString(), unit: 'q', trend: '+0.0%', status: 'Stable' }
  ];

  const getFilteredResults = () => {
    let list = [...currentPrices];
    // filter Category mostly ignored for demo logic, but can filter by filterTag
    if (filterTag !== 'All') {
      list = list.filter(r => r.status.includes(filterTag) || r.type.includes(filterTag));
    }
    
    if (sortMode === 'Highest Price') list = list.sort((a,b) => parseInt(b.price) - parseInt(a.price));
    return list;
  };

  const handleCsvDownload = () => {
    const csvRows = ['Commodity,Price (INR),Unit,Trend'];
    currentPrices.forEach(item => csvRows.push(`${item.name},${item.price},${item.unit},${item.trend}`));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrinova_market_prices.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    addToast('Pricelist CSV downloaded!', 'success');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '1.5rem', paddingBottom: '6rem' }}>
      
      {/* 1. Header Area aligned to Crop Recs */}
      <header className="m-bot-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '16px' }}>
          <TrendingUp color="var(--primary)" size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Market Intelligence</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Live regional commodity prices</p>
        </div>
      </header>

      {/* 2. Select Category (Matches Select Season) */}
      <div className="m-bot-6">
        <h3 className="m-bot-2" style={{ fontSize: '1rem', fontWeight: 600 }}>Commodity Type</h3>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {categories.map(c => (
            <div 
              key={c.name} 
              onClick={() => { setCategory(c.name); addToast(`${c.name} market loaded`, 'success'); }}
              style={{
                flex: '1', minWidth: '85px',
                padding: '1rem 0.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                border: category === c.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                borderRadius: '20px', background: 'var(--surface)',
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: category === c.name ? '0 4px 12px rgba(33, 131, 66, 0.1)' : 'none',
                transform: category === c.name ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ background: category === c.name ? 'var(--primary-light)' : 'var(--background)', padding: '0.75rem', borderRadius: '16px', transition: 'all 0.2s' }}>
                {c.icon}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: category === c.name ? 600 : 500, color: category === c.name ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Market Settings (Matches Soil Conditions) */}
      <div className="glass-card m-bot-6" style={{ padding: '1.25rem' }}>
        <h3 className="m-bot-4" style={{ fontSize: '1rem', fontWeight: 600 }}>Market Filters</h3>
        
        <div className="m-bot-4">
          <label className="input-label">Market Region</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={marketRegion} 
              onChange={(e) => { setMarketRegion(e.target.value); addToast(`Switched to ${e.target.value} prices`, 'success'); }} 
              className="input-field" 
              style={{ fontWeight: 500, cursor: 'pointer' }}
            >
              <option value="Local">{user?.location || 'Local Mandi'} (Near You)</option>
              <option value="State">State Average Prices</option>
              <option value="National">National / Export Index</option>
            </select>
            <ChevronDown size={20} color="var(--text-muted)" style={{ position: 'absolute', right: '1rem', top: '16px', pointerEvents: 'none' }} />
          </div>
        </div>

        <div className="m-bot-4">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Crop Quality Grade</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Level {quality}</span>
          </label>
          <input 
            type="range" min="1" max="10" step="1" 
            value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} 
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px', background: 'linear-gradient(90deg, #3498db 0%, #1e8b34 50%, #f1c40f 100%)', borderRadius: '4px', WebkitAppearance: 'none' }} 
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span>Standard (1)</span><span>Premium (10)</span>
          </div>
        </div>
      </div>

      {/* 4. Filter Tags and Results (Matches Prices List) */}
      <div className="m-bot-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Live Quotes for {category}</h3>
          <div className="btn" onClick={() => setSortMode(sortMode === 'Trend' ? 'Highest Price' : 'Trend')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
            {sortMode} <ChevronDown size={16} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none', marginBottom: '0.5rem' }}>
          {['All', 'High Demand', 'Stable', 'Vegetable'].map(tag => (
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
          {getFilteredResults().map((res, i) => (
            <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', margin: 0, cursor: 'pointer' }} onClick={() => addToast(`Viewing price history for ${res.name}`, 'success')}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '16px', background: 'var(--background)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
              }}>
                {res.name.includes('Rice') ? '🌾' : res.name.includes('Wheat') ? '🍞' : res.name.includes('Cotton') ? '☁️' : res.name.includes('Maize') ? '🌽' : '🌿'}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{res.name}</h4>
                    <span style={{ fontSize: '0.75rem', background: 'var(--background)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 500 }}>
                      {res.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', marginTop: '0.5rem' }}>
                  <span>Price Quote</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.125rem' }}>₹{res.price} <span style={{fontSize: '0.75rem', fontWeight: 400}}>/ {res.unit}</span></span>
                </div>
                
                <div className="progress-container" style={{background: 'var(--background)'}}>
                  <div className="progress-fill" style={{ width: res.trend.includes('-') ? '40%' : '80%', background: res.trend.includes('-') ? 'var(--danger)' : 'var(--primary)' }}></div>
                </div>
              </div>
              <ChevronDown size={20} color="var(--border)" style={{ transform: 'rotate(-90deg)' }} />
            </div>
          ))}
          {getFilteredResults().length === 0 && (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No markets match this filter.</div>
          )}
        </div>
      </div>

      {/* Legacy Graphs Area */}
      {/* Price Trends */}
      <div className="glass-card m-bot-6" style={{ padding: '1.25rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <TrendingUp size={24} color="var(--primary)" /> Commodity Trends
          </h3>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface)', borderRadius: '24px', padding: '4px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            {['1m', '3m', '6m'].map(t => (
              <span key={t} onClick={() => handleTimeframeChange(t)} style={{ 
                padding: '6px 14px', fontSize: '0.875rem', fontWeight: 600, borderRadius: '20px', cursor: 'pointer',
                background: timeframe === t ? 'var(--primary)' : 'transparent',
                color: timeframe === t ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Mock Line Chart in SVG */}
        <div style={{ height: '220px', width: '100%', position: 'relative', marginBottom: '1.5rem', opacity: loadingChart ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
            <line x1="40" y1="80" x2="380" y2="80" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
            <line x1="40" y1="140" x2="380" y2="140" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
            <line x1="40" y1="200" x2="380" y2="200" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.4" />
            
            <text x="30" y="24" fontSize="10" fill="var(--text-muted)" textAnchor="end">8000</text>
            <text x="30" y="84" fontSize="10" fill="var(--text-muted)" textAnchor="end">6000</text>
            <text x="30" y="144" fontSize="10" fill="var(--text-muted)" textAnchor="end">4000</text>
            <text x="30" y="204" fontSize="10" fill="var(--text-muted)" textAnchor="end">2000</text>
            
            <text x="40" y="215" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Oct</text>
            <text x="108" y="215" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Nov</text>
            <text x="176" y="215" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Dec</text>
            <text x="244" y="215" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Jan</text>
            <text x="312" y="215" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Feb</text>
            <text x="380" y="215" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Mar</text>
            
            <polyline points="40,50 108,55 176,50 244,48 312,45 380,44" fill="none" stroke="#3498db" strokeWidth="2.5" className="path-anim" />
            <polyline points="40,150 108,150 176,145 244,145 312,145 380,140" fill="none" stroke="#f1c40f" strokeWidth="2.5" className="path-anim" style={{animationDelay: '0.1s'}} />
            <polyline points="40,155 108,155 176,152 244,153 312,152 380,150" fill="none" stroke="var(--primary)" strokeWidth="2.5" className="path-anim" style={{animationDelay: '0.2s'}} />
            
            {[[40,50], [108,55], [176,50], [244,48], [312,45], [380,44]].map((pt, i) => (
              <circle key={`b${i}`} cx={pt[0]} cy={pt[1]} r="4.5" fill="var(--surface)" stroke="#3498db" strokeWidth="2" />
            ))}
            {[[40,150], [108,150], [176,145], [244,145], [312,145], [380,140]].map((pt, i) => (
              <circle key={`y${i}`} cx={pt[0]} cy={pt[1]} r="4.5" fill="var(--surface)" stroke="#f1c40f" strokeWidth="2" />
            ))}
            {[[40,155], [108,155], [176,152], [244,153], [312,152], [380,150]].map((pt, i) => (
              <circle key={`g${i}`} cx={pt[0]} cy={pt[1]} r="4.5" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
            ))}
          </svg>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 10, height: 10, background: 'var(--primary)', borderRadius: '3px'}}></div> Rice</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 10, height: 10, background: '#f1c40f', borderRadius: '3px'}}></div> Wheat</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 10, height: 10, background: '#3498db', borderRadius: '3px'}}></div> Cotton</span>
        </div>
      </div>

      {/* Demand vs Supply */}
      <div className="glass-card m-bot-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Demand vs Supply</h3>
          <button className="btn btn-outline" onClick={handleCsvDownload} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '12px' }}>
            <Download size={16} /> CSV
          </button>
        </div>
        
        <div style={{ height: '180px', width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <line x1="30" y1="30" x2="390" y2="30" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="90" x2="390" y2="90" stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />
            <line x1="30" y1="150" x2="390" y2="150" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.4" />
            
            <text x="20" y="34" fontSize="10" fill="var(--text-muted)" textAnchor="end">100</text>
            <text x="20" y="94" fontSize="10" fill="var(--text-muted)" textAnchor="end">75</text>
            <text x="20" y="154" fontSize="10" fill="var(--text-muted)" textAnchor="end">50</text>
            
            <text x="30" y="165" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Jan</text>
            <text x="100" y="165" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Feb</text>
            <text x="170" y="165" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Mar</text>
            <text x="240" y="165" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Apr</text>
            <text x="310" y="165" fontSize="10" fill="var(--text-muted)" textAnchor="middle">May</text>
            <text x="380" y="165" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Jun</text>

            <defs>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05"/>
              </linearGradient>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3498db" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#3498db" stopOpacity="0.05"/>
              </linearGradient>
            </defs>

            <path d="M30,55 Q65,60 100,55 T170,60 T240,75 T310,65 T380,50 L380,150 L30,150 Z" fill="url(#gradBlue)" className="fade-in-anim" />
            <path d="M30,55 Q65,60 100,55 T170,60 T240,75 T310,65 T380,50" fill="none" stroke="#3498db" strokeWidth="2.5" className="path-anim" />
            
            <path d="M30,35 Q65,40 100,30 T170,20 T240,10 T310,25 T380,30 L380,150 L30,150 Z" fill="url(#gradGreen)" className="fade-in-anim" style={{animationDelay: '0.2s'}} />
            <path d="M30,35 Q65,40 100,30 T170,20 T240,10 T310,25 T380,30" fill="none" stroke="var(--primary)" strokeWidth="2.5" className="path-anim" style={{animationDelay: '0.2s'}} />
          </svg>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', marginTop: '1.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 10, height: 10, background: 'var(--primary)', borderRadius: '3px'}}></div> Demand</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 10, height: 10, background: '#3498db', borderRadius: '3px'}}></div> Supply</span>
        </div>
      </div>
      
      <style>{`
        .path-anim { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .fade-in-anim { opacity: 0; animation: fadeArea 1s ease-in forwards; animation-delay: 0.5s; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        @keyframes fadeArea { to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Market;
