import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Trash2, Bot } from 'lucide-react';

const parseTable = (text) => {
  const lines = text.split('\n');
  const tableIndex = lines.findIndex(l => l.includes('|'));
  if (tableIndex === -1) return <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{text}</p>;

  // A very basic markdown table parser strategy
  // We just render as pre-wrap for simplicity if it fails complex parsing, or we can use the old stable trick:
  const preamble = lines.slice(0, tableIndex).join('\n');
  
  // Find where table ends
  let tableEndIndex = tableIndex;
  while (tableEndIndex < lines.length && lines[tableEndIndex].includes('|')) {
    tableEndIndex++;
  }
  
  const tableLines = lines.slice(tableIndex, tableEndIndex);
  const postamble = lines.slice(tableEndIndex).join('\n');

  const rows = tableLines.filter(line => !line.includes('----') && line.includes('|')).map((line, i) => {
    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    if (i === 0) {
      return <tr key={i}>{cells.map((c, j) => <th key={j}>{c}</th>)}</tr>;
    }
    return <tr key={i}>{cells.map((c, j) => <td key={j}>{c}</td>)}</tr>;
  });

  return (
    <div>
      {preamble && <p style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{preamble}</p>}
      {rows.length > 0 && (
        <div style={{ overflowX: 'auto', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
          <table className="chat-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>{rows[0]}</thead>
            <tbody>{rows.slice(1)}</tbody>
          </table>
        </div>
      )}
      {postamble && <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{postamble}</p>}
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Hello! I'm AGRINOVA AI powered by Google Gemini! Run by an advanced LLM, I am fully equipped to answer real-time deep agricultural questions. Ask away!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        message: input,
        history: messages
      });
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'ai',
        text: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'ai',
        text: 'Sorry, I lost connection to the server! Make sure the Python backend is running and the Gemini API key is valid.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <header className="m-bot-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%' }}>
            <Bot color="var(--primary)" size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', marginBottom: '0.125rem', fontWeight: 600 }}>AGRINOVA AI</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
              Online
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>🇬🇧 EN</span>
          <Trash2 size={24} color="var(--text-muted)" onClick={clearChat} style={{ cursor: 'pointer' }} />
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, idx) => (
          <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            {msg.sender === 'ai' && (
              <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
                ⭐
              </div>
            )}
            <div className={`chat-bubble ${msg.sender}`} style={{ 
              position: 'relative', 
              background: msg.sender === 'ai' ? '#f4f4f0' : 'var(--primary)', 
              color: msg.sender === 'ai' ? '#212529' : 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              padding: '1.25rem',
              borderRadius: '20px',
              borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '20px',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
            }}>
              {parseTable(msg.text)}
              {msg.time && (
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '0.75rem', 
                  color: msg.sender === 'ai' ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  {msg.time}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', marginTop: 'auto', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <input 
          type="text" 
          placeholder="Ask about farming..." 
          className="input-field" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, borderRadius: '24px', paddingLeft: '1.5rem', background: 'var(--background)' }}
        />
        <button className="btn btn-primary" onClick={handleSend} style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0 }}>
          <Send size={24} style={{ marginLeft: '-4px' }} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
