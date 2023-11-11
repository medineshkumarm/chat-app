import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000'); // Use the correct server URL

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    setUser(prompt('Please enter your name:'));
  }, []);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      // Notify user when a new message is received
      if (msg.user !== user) {
        notifyUser(msg.user, msg.message);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', { user, message });
      setMessage('');
    }
  };
  const notifyUser = (sender, content) => {
    if (Notification.permission === 'granted') {
      new Notification(`${sender} says:`, { body: content });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(`${sender} says:`, { body: content });
        }
      });
    }
  };
  return (
    <div className='chat-container'>
      <ul className='chat-area'>
        {messages.map((msg, index) => (
          <li key={index} className='chat-message'>
            {msg.user ? <strong>{msg.user}:</strong> : 'System: '}
            {msg.message}
          </li>
        ))}
        message
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          placeholder='send a message'
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
export default App;