import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon, Leaf, ScanLine, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '../App';

const DiseaseDetection = () => {
  const [tab, setTab] = useState('Detect');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const addToast = useToast();
  
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('agrinova_disease_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePredict = async (imgData) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/disease-detect', { image_url: imgData });
      const data = res.data;
      setResult(data);
      addToast(`Diagnosis Complete: ${data.disease}`, data.status === 'Healthy' ? 'success' : 'warning');
      
      // Save to history
      const newHistory = [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        image: imgData,
        disease: data.disease,
        confidence: data.confidence,
        status: data.status
      }, ...history].slice(0, 10);
      
      setHistory(newHistory);
      localStorage.setItem('agrinova_disease_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error(err);
      addToast('Failed to analyze image with AI', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image using canvas before sending to AI to save bandwidth and localStorage
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(compressedBase64);
          handlePredict(compressedBase64);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('agrinova_disease_history');
    addToast('History cleared', 'success');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '1rem', paddingBottom: '6rem' }}>
      <header className="m-bot-6" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ background: 'var(--danger-light)', padding: '0.75rem', borderRadius: '16px' }}>
          <ScanLine color="var(--danger)" size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Disease Detection</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>AI-powered crop diagnosis</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="m-bot-4" style={{ display: 'flex', background: 'var(--surface)', borderRadius: '16px', padding: '6px', border: '1px solid var(--border)' }}>
        <div 
          onClick={() => setTab('Detect')}
          style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', background: tab === 'Detect' ? 'var(--background)' : 'transparent', fontWeight: tab === 'Detect' ? 600 : 500, color: tab === 'Detect' ? 'var(--text-main)' : 'var(--text-muted)', transition: 'all 0.2s', boxShadow: tab === 'Detect' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>
          Detect
        </div>
        <div 
          onClick={() => setTab('History')}
          style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', background: tab === 'History' ? 'var(--background)' : 'transparent', fontWeight: tab === 'History' ? 600 : 500, color: tab === 'History' ? 'var(--text-main)' : 'var(--text-muted)', transition: 'all 0.2s', boxShadow: tab === 'History' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>
          History
        </div>
      </div>

      {tab === 'Detect' && (
        <div className="animate-fade-in">
          {/* Main Upload Area */}
          <div className="glass-card m-bot-4" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ 
              background: 'var(--background)', 
              height: '300px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              color: 'var(--text-muted)',
              backgroundImage: preview ? `url(${preview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              {loading ? (
                <div style={{ background: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                  <ScanLine size={48} className="m-bot-2 animate-spin" style={{ animation: 'pulse 1.5s infinite' }} />
                  <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1.1); } 50% { opacity: 0.5; transform: scale(1); } 100% { opacity: 1; transform: scale(1.1); } }`}</style>
                  <p style={{ fontWeight: 500 }}>Scanning leaf architecture...</p>
                </div>
              ) : result ? (
                <div className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.9)', padding: '2rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)' }}>
                  <CheckCircle size={48} color={result.status === 'Healthy' ? 'var(--primary)' : 'var(--danger)'} className="m-bot-2" style={{ margin: '0 auto' }} />
                  <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>{result.disease}</h3>
                  <p style={{ fontWeight: 600, color: result.status === 'Healthy' ? 'var(--primary)' : 'var(--danger)' }}>{result.confidence}% Confidence</p>
                  <button className="btn btn-outline" style={{ marginTop: '1.5rem', padding: '0.5rem 1rem' }} onClick={() => {setResult(null); setPreview(null);}}>Scan New Image</button>
                </div>
              ) : !preview ? (
                <>
                  <Camera size={64} className="m-bot-4" style={{ opacity: 0.3 }} />
                  <p style={{ maxWidth: '200px', textAlign: 'center', lineHeight: 1.5 }}>Take or upload a photo of the affected plant</p>
                </>
              ) : null}
            </div>
            
            {(!result && !loading) && (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.875rem' }} onClick={() => cameraInputRef.current?.click()}>
                  <Camera size={20} /> Camera
                </button>
                <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.875rem', background: 'var(--surface)' }} onClick={() => galleryInputRef.current?.click()}>
                  <ImageIcon size={20} /> Gallery
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  style={{ display: 'none' }} 
                  ref={cameraInputRef}
                  onChange={handleImageUpload}
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  ref={galleryInputRef}
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="glass-card m-bot-4">
            <h3 className="m-bot-4" style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
              <Leaf size={22} color="var(--primary)" /> Tips for best results
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <li style={{ paddingLeft: '0.5rem' }}>Capture the affected area in clear, natural light</li>
              <li style={{ paddingLeft: '0.5rem' }}>Include both healthy and affected parts for comparison</li>
              <li style={{ paddingLeft: '0.5rem' }}>Avoid blurry or dark images</li>
              <li style={{ paddingLeft: '0.5rem' }}>Photograph leaves from both top and underside</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'History' && (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
          {history.length === 0 ? (
            <div className="text-center" style={{ padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Clock size={64} style={{ opacity: 0.3, margin: '0 auto 1.5rem' }} />
              <p style={{ fontSize: '1.125rem', lineHeight: 1.5 }}>No detection history yet.<br/>Upload an image to get started.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={clearHistory}>
                  <Trash2 size={16} /> Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {history.map((item) => (
                  <div key={item.id} className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', margin: 0 }}>
                    <div style={{ 
                      width: '64px', height: '64px', borderRadius: '12px', background: 'var(--background)',
                      backgroundImage: item.image ? `url(${item.image})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0
                    }}>
                      {!item.image && <Camera size={24} color="var(--text-muted)" style={{ margin: '20px' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{item.disease}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: item.status === 'Healthy' ? 'var(--primary)' : 'var(--danger)' }}>
                          {item.confidence}% Confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
