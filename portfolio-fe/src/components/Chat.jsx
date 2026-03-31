import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import { chatApi } from '../services/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const myUserId = parseInt(localStorage.getItem('userId')) || 1;
  const otherUserId = myUserId === 1 ? 2 : 1; 
  const partnerName = myUserId === 1 ? 'Hà' : 'Huy';

  useEffect(() => {
    loadMessages();
    
    // Optional: simple polling to get new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages(false);
    }, 5000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = async (scrollToBottom = true) => {
    try {
      const res = await chatApi.getConversation(otherUserId, 0, 50);
      if (res.success) {
        // Backend returns newest first based on API doc, so we reverse it to render top-to-bottom
        const sortedMsgs = res.data.content.reverse();
        setMessages(sortedMsgs);
        if (scrollToBottom) {
          setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Optimistic UI update
    const tempMsg = {
      id: Date.now(),
      senderId: myUserId,
      receiverId: otherUserId,
      content: input,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInput('');
    endRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const res = await chatApi.sendMessage(otherUserId, tempMsg.content);
      if (res.success) {
        // Replace temp message with real message from server
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
      }
    } catch (err) {
      console.error("Format Failed to send message:", err);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fade-in chat-container glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="chat-header">
        <img 
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" 
          alt="Partner" 
          className="avatar"
        />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>{partnerName}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span>
            Active now
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {loading && messages.length === 0 ? (
          <div style={{textAlign: 'center', color: 'var(--text-light)', marginTop: '20px'}}>Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.senderId === myUserId ? 'sent' : 'received'}`}>
              {msg.content}
              <span className="message-time">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend} style={{ borderTop: '1px solid var(--glass-border)' }}>
        <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
          <ImageIcon size={24} />
        </button>
        <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
          <Smile size={24} />
        </button>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn" disabled={!input.trim()}>
          <Send size={20} style={{ marginLeft: '4px' }} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
