import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('backendchatweb-production.up.railway.app');

const ChatMessages = memo(({ messages, username, chatEndRef }) => {
  // hanya render 50 pesan terakhir untuk meringankan DOM
  const visibleMessages = messages.slice(-50);

  return (
    <div className="chat-box">
      {visibleMessages.length === 0 ? (
        <div className="empty-chat">
          <div className="empty-icon">🌊</div>
          <p>Start the conversation!</p>
          <span>Send your first message below</span>
        </div>
      ) : (
        visibleMessages.map((msg, i) => {
          const mine = msg.username === username;
          return (
            <div
              key={i}
              className={mine ? 'message-bubble mine' : 'message-bubble other'}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="sender">{mine ? 'You' : msg.username}</span>
                  <span className="time">
                    {msg.timestamp ||
                      new Date(msg.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                </div>
                <p className="message-text">{msg.message || msg.text}</p>
              </div>
            </div>
          );
        })
      )}
      <div ref={chatEndRef} />
    </div>
  );
});

function App() {
  const [username, setUsername] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => console.log('connected to server'));
    socket.on('pesan lama', (msgs) => setMessages(msgs || []));
    socket.on('chat message', (msg) =>
      setMessages((prev) => [...prev, msg])
    );
    socket.on('online user', (data) => setOnlineCount(data.count));

    return () => {
      socket.off('connect');
      socket.off('pesan lama');
      socket.off('chat message');
      socket.off('online user');
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const handleLogin = useCallback(() => {
    if (username.trim()) {
      setIsLogged(true);
      socket.emit('user joined', username);
    }
  }, [username]);

  const sendMessage = useCallback(() => {
    if (text.trim()) {
      const msg = { username, message: text };
      socket.emit('chat message', msg);
      setText('');
    }
  }, [text, username]);

  const handleInputChange = useCallback((e) => setText(e.target.value), []);
  const handleKeyDown = useCallback(
    (e) => e.key === 'Enter' && sendMessage(),
    [sendMessage]
  );

  if (!isLogged) {
    return (
      <div className="login-page">
        <div className="login-box-sea">
          <h1>🌊 SeaChat</h1>
          <p>Masuk dan ngobrol di pantai!</p>
          <input
            type="text"
            placeholder="Masukkan nama kamu..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin}>Mulai Chat 🐚</button>
        </div>
        <div className="wave-bg">
          <div className="wave" id="wave1" />
          <div className="wave" id="wave2" />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="simple-background" />

      <div className="chat-card">
        <div className="chat-header">
          <div className="header-content">
            <div className="header-title">
              <div className="title-simple">
                <h3>🏖️ SeaChat</h3>
              </div>
              <div className="header-info">
                <div className="online-indicator">
                  <div className="pulse-dot" />
                  <span>{onlineCount} online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="user-section">
            <div className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-greeting">Hello,</span>
              <span className="username-display">{username}</span>
            </div>
          </div>
        </div>

        <ChatMessages
          messages={messages}
          username={username}
          chatEndRef={chatEndRef}
        />

        <div className="chat-input-container">
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className={text.trim() ? 'send-btn active' : 'send-btn'}
              disabled={!text.trim()}
            >
              {text.trim() ? '🌊' : '🐚'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
