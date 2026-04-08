import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import { chatApi, authApi } from '../services/api';
import { USERS } from '../constants/users';
import { initNotifications, showMessageNotification } from '../services/notifications';

const EMOJIS = ['❤️', '😍', '🥰', '😘', '💕', '😊', '😂', '🥺', '😭', '✨', '💖', '🌹', '🐱', '🐶', '🎉'];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const endRef = useRef(null);
  const stompClientRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const onlineTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const myUserId = parseInt(localStorage.getItem('userId')) || 1;
  const otherUserId = myUserId === 1 ? 2 : 1;
  const partner = USERS[otherUserId];

  // Request push notification permission when Chat first opens
  useEffect(() => { initNotifications(); }, []);

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

  // Load partner data from API
  const loadPartnerData = useCallback(async () => {
    try {
      const res = await authApi.getUserById(otherUserId);
      if (res.success) {
        setPartnerData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch partner data:', err);
    }
  }, [otherUserId]);

  // Kết nối WebSocket
  useEffect(() => {
    loadMessages();
    loadPartnerData();

    const token = localStorage.getItem('token');
    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL || `ws://localhost:8080/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);

        // Subscribe to messages FIRST
        client.subscribe(`/user/${myUserId}/queue/messages`, (frame) => {
          const msg = JSON.parse(frame.body);
          console.log('Received:', msg.type, msg);

          // Handle typing indicator
          if (msg.type === 'typing') {
            setPartnerTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setPartnerTyping(false);
            }, 3000);
            return;
          }

          // Handle online status
          if (msg.type === 'online') {
            console.log('Partner came online');
            setPartnerOnline(true);
            // Reset timeout
            if (onlineTimeoutRef.current) clearTimeout(onlineTimeoutRef.current);
            onlineTimeoutRef.current = setTimeout(() => {
              setPartnerOnline(false);
            }, 30000); // Consider offline after 30s no heartbeat
            return;
          }

          // Handle regular messages
          setMessages(prev => {
            // Avoid duplicate (optimistic update)
            if (prev.some(m => m.id === msg.id)) {
              return prev.map(m => m.id === msg.id ? msg : m);
            }
            // Nếu tin nhắn từ partner → hiện push notification
            if (msg.senderId !== myUserId) {
              const displayName = partnerData?.name || partner?.name || 'Partner';
              const displayAvatar = partnerData?.avatar || partner?.avatar;
              showMessageNotification(displayName, msg.content, displayAvatar);
            }
            return [...prev, msg];
          });
          setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        });

        // Send initial online status
        client.publish({
          destination: '/app/chat.online',
          body: JSON.stringify({ receiverId: otherUserId, type: 'online' }),
        });

        // Send heartbeat every 10 seconds to keep online status
        heartbeatIntervalRef.current = setInterval(() => {
          if (client.connected) {
            client.publish({
              destination: '/app/chat.online',
              body: JSON.stringify({ receiverId: otherUserId, type: 'online' }),
            });
          }
        }, 10000);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        setPartnerOnline(false);
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      },
      onStompError: (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
        setPartnerOnline(false);
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (onlineTimeoutRef.current) clearTimeout(onlineTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      client.deactivate();
    };
  }, [myUserId, loadMessages, loadPartnerData, otherUserId, partnerData, partner]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendTypingIndicator = useCallback(() => {
    const now = Date.now();
    // Only send every 300ms to avoid spam
    if (now - lastTypingSentRef.current > 300 && stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({ receiverId: otherUserId, type: 'typing' }),
      });
      lastTypingSentRef.current = now;
    }
  }, [otherUserId]);

  const handleInput = (e) => {
    setInput(e.target.value);
    sendTypingIndicator();
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setShowEmoji(false);
    setPartnerTyping(false);

    // Optimistic UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: myUserId,
      receiverId: otherUserId,
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    // Gửi qua WebSocket nếu connected, fallback REST
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverId: otherUserId, content: text, type: 'message' }),
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
          src={partnerData?.avatar || partner?.avatar}
          alt={partnerData?.name || partner?.name}
          className="avatar"
        />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {partnerData?.name || partner?.name}
          </h3>
          <div style={{ fontSize: '0.8rem', color: partnerOnline ? 'var(--primary)' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: partnerOnline ? 'var(--primary)' : '#aaa', borderRadius: '50%', display: 'inline-block' }}></span>
            {partnerTyping ? (
              <span style={{ fontStyle: 'italic', animation: 'pulse 1.5s infinite' }}>typing...</span>
            ) : (
              partnerOnline ? 'Online' : 'Offline'
            )}
          </div>
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
          onChange={handleInput}
        />
        <button type="submit" className="send-btn" disabled={!input.trim()}>
          <Send size={20} style={{ marginLeft: '4px' }} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
