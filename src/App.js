import React from 'react';
import Logo from './components/Logo';
import ChatBox from './components/ChatBox';
import './styles.css';

function App() {
  return (
    <div className="App">
      <div className="logo">
        <Logo />
      </div>
      <div className="header">
        <div className="examples">
        </div>
      </div>
      <div className="chatbox-container">
        <ChatBox />
      </div>
    </div>
  );
}

export default App;
