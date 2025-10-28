import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('backendchatweb-production.up.railway.app');

function App() {
  const [username, setUsername] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const chatEndRef = useRef(null);

  useEffect(function () {
    socket.on('connect', function () {
      console.log('connected to server');
    });

    socket.on('pesan lama', function (msgs) {
      console.log('Menerima pesan lama:', msgs);
      setMessages(msgs);
    });

    socket.on('chat message', function (msg) {
      console.log('Menerima pesan baru:', msg);
      setMessages(function (prev) { 
        return [...prev, msg]; 
      });
    });

    socket.on('user count', function (count) {
      setOnlineCount(count);
    });

    return function cleanup() {
      socket.off('connect');
      socket.off('pesan lama');
      socket.off('chat message');
      socket.off('user count');
    };
  }, []);

  useEffect(function () {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  function handleLogin() {
    if (username.trim()) {
      setIsLogged(true);
      socket.emit('user joined', username);
    }
  }

  function sendMessage() {
    if (text.trim()) {
      const msg = { 
        username: username, 
        message: text,
      };
      console.log('Mengirim pesan:', msg);
      socket.emit('chat message', msg);
      setText('');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  function handleInputChange(e) {
    setText(e.target.value);
  }

  // Halaman Login 🌊
  if (!isLogged) {
    return (
      React.createElement('div', { className: 'login-page' },
        React.createElement('div', { className: 'login-box-sea' },
          React.createElement('h1', null, '🌊 SeaChat'),
          React.createElement('p', null, 'Masuk dan ngobrol di pantai!'),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Masukkan nama kamu...',
            value: username,
            onChange: function (e) { setUsername(e.target.value); },
            onKeyDown: function (e) { if (e.key === 'Enter') handleLogin(); }
          }),
          React.createElement('button', { onClick: handleLogin }, 'Mulai Chat 🐚')
        ),
        React.createElement('div', { className: 'wave-bg' },
          React.createElement('div', { className: 'wave', id: 'wave1' }),
          React.createElement('div', { className: 'wave', id: 'wave2' })
        )
      )
    );
  }

  // Halaman Chat 🏖️
  return (
    React.createElement('div', { className: 'chat-page' },
      React.createElement('div', { className: 'simple-background' }),
      
      React.createElement('div', { className: 'chat-card' },
        React.createElement('div', { className: 'chat-header' },
          React.createElement('div', { className: 'header-content' },
            React.createElement('div', { className: 'header-title' },
              React.createElement('div', { className: 'title-simple' },
                React.createElement('h3', null, '🏖️ SeaChat')
              ),
              React.createElement('div', { className: 'header-info' },
                React.createElement('div', { className: 'online-indicator' },
                  React.createElement('div', { className: 'pulse-dot' }),
                  React.createElement('span', null, onlineCount + ' online')
                )
              )
            )
          ),
          React.createElement('div', { className: 'user-section' },
            React.createElement('div', { className: 'user-avatar' }, 
              username.charAt(0).toUpperCase()
            ),
            React.createElement('div', { className: 'user-info' },
              React.createElement('span', { className: 'user-greeting' }, 'Hello,'),
              React.createElement('span', { className: 'username-display' }, username)
            )
          )
        ),
        
        React.createElement('div', { className: 'chat-box' },
          messages.length === 0 ? 
            React.createElement('div', { className: 'empty-chat' },
              React.createElement('div', { className: 'empty-icon' }, '🌊'),
              React.createElement('p', null, 'Start the conversation!'),
              React.createElement('span', null, 'Send your first message below')
            )
            :
            messages.map(function (msg, i) {
              const mine = msg.username === username;
              return React.createElement('div', {
                key: i,
                className: mine ? 'message-bubble mine' : 'message-bubble other'
              },
                React.createElement('div', { className: 'message-content' },
                  React.createElement('div', { className: 'message-header' },
                    React.createElement('span', { className: 'sender' }, mine ? 'You' : msg.username),
                    React.createElement('span', { className: 'time' }, 
                      msg.timestamp || new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    )
                  ),
                  React.createElement('p', { className: 'message-text' }, msg.message || msg.text)
                )
              );
            }),
          React.createElement('div', { ref: chatEndRef })
        ),
        
        React.createElement('div', { className: 'chat-input-container' },
          React.createElement('div', { className: 'chat-input' },
            React.createElement('input', {
              type: 'text',
              placeholder: 'Type a message...',
              value: text,
              onChange: handleInputChange,
              onKeyDown: handleKeyDown
            }),
            React.createElement('button', { 
              onClick: sendMessage,
              className: text.trim() ? 'send-btn active' : 'send-btn',
              disabled: !text.trim()
            }, 
              text.trim() ? '🌊' : '🐚'
            )
          )
        )
      )
    )
  );
}

export default App;
