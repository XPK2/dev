import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatApi } from '../services/api';

const EMOJIS = ['❤️', '😍', '🥰', '😘', '💕', '😊', '😂', '🥺', '😭', '✨', '💖', '🌹', '🐱', '🐶', '🎉'];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);
  const stompClientRef = useRef(null);

  const myUserId = parseInt(localStorage.getItem('userId')) || 1;
  const otherUserId = myUserId === 1 ? 2 : 1;
  const partnerName = myUserId === 1 ? 'Hà' : 'Huy';

  // Load lịch sử tin nhắn
  const loadMessages = useCallback(async () => {
    try {
      const res = await chatApi.getConversation(otherUserId, 0, 50);
      if (res.success) {
        const sorted = [...res.data.content].reverse();
        setMessages(sorted);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  // Kết nối WebSocket
  useEffect(() => {
    loadMessages();

    const token = localStorage.getItem('token');
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/user/${myUserId}/queue/messages`, (frame) => {
          const msg = JSON.parse(frame.body);
          setMessages(prev => {
            // Tránh duplicate (optimistic update)
            if (prev.some(m => m.id === msg.id)) {
              return prev.map(m => m.id === msg.id ? msg : m);
            }
            return [...prev, msg];
          });
          setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [myUserId, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setShowEmoji(false);

    // Optimistic UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: myUserId,
      receiverId: otherUserId,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Gửi qua WebSocket nếu connected, fallback REST
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverId: otherUserId, content: text }),
      });
    } else {
      try {
        const res = await chatApi.sendMessage(otherUserId, text);
        if (res.success) {
          setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
        }
      } catch (err) {
        console.error('Send failed:', err);
      }
    }
  };

  const handleEmojiClick = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmoji(false);
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
          <span style={{ fontSize: '0.8rem', color: connected ? 'var(--primary)' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: connected ? 'var(--primary)' : '#aaa', borderRadius: '50%', display: 'inline-block' }}></span>
            {connected ? 'Online' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '20px' }}>Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.senderId === myUserId ? 'sent' : 'received'}`}>
              {msg.content}
              <span className="message-time">{formatTime(msg.createdAt)}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(255,255,255,0.7)'
        }}>
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '2px' }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={handleSend} style={{ borderTop: '1px solid var(--glass-border)' }}>
        <button
          type="button"
          onClick={() => setShowEmoji(p => !p)}
          style={{ background: 'none', border: 'none', color: showEmoji ? 'var(--primary)' : 'var(--text-light)', cursor: 'pointer' }}
        >
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
