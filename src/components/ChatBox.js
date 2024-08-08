import React, { useState } from 'react';
import axios from 'axios';

const ChatBox = () => {
  const [messages, setMessages] = useState([{ text: "Hello", from: "system" }]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, from: "user" };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat/completions', {
        message: input,
      });

      const systemResponse = {
        text: response.data.choices[0].message.content,
        from: "system",
      };

      setMessages((prevMessages) => [...prevMessages, systemResponse]);
    } catch (error) {
      console.error("Error fetching API response:", error);
      const errorMessage = {
        text: "Error: Unable to fetch response.",
        from: "system",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
