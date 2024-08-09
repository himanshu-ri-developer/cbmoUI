import React, { useState } from 'react';
import axios from 'axios';

const ChatBox = () => {
  const [messages, setMessages] = useState([{ text: "Hello", from: "system" }]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("text-generation");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, from: "user" };
    setMessages([...messages, userMessage]);
    setInput(""); 
    setLoading(true);

    try {
      if (mode === "text-generation") {
        const response = await axios.post('http://localhost:5000/api/chat/completions', {
          message: input,
        });

        const formattedText = formatText(response.data.choices[0].message.content);
        const systemResponse = {
          text: formattedText,
          from: "system",
        };

        setMessages((prevMessages) => [...prevMessages, systemResponse]);
      } else if (mode === "image-generation") {
        const interval = setInterval(() => {
          setProgress((oldProgress) => {
            if (oldProgress === 100) {
              clearInterval(interval);
              return 100;
            }
            return Math.min(oldProgress + Math.random() * 10, 100);
          });
        }, 500);

        const response = await axios.post('http://localhost:5000/api/generate-image', {
          prompt: input,
        }, { responseType: 'blob' });

        const imageUrl = URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));

        const systemResponse = {
          image: imageUrl,
          from: "system",
        };

        setMessages((prevMessages) => [...prevMessages, systemResponse]);
        clearInterval(interval);
        setProgress(0);
      }
    } catch (error) {
      console.error("Error fetching API response:", error);
      const errorMessage = {
        text: "Error: Unable to fetch response.",
        from: "system",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    let formattedText = text.replace(/###/g, "•");
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
    return formattedText;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  return (
    <div className="chatbox">
      <div className="mode-selection">
        <h3>Please select the mode:</h3>
        <label>
          <input
            type="radio"
            value="text-generation"
            checked={mode === "text-generation"}
            onChange={handleModeChange}
          />
          Text Generation
        </label>
        <label>
          <input
            type="radio"
            value="image-generation"
            checked={mode === "image-generation"}
            onChange={handleModeChange}
          />
          Image Generation
        </label>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from}`}>
            {msg.text && <div dangerouslySetInnerHTML={{ __html: msg.text }} className="formatted-text" />}
            {msg.image && (
              <div className="image-message">
                <img src={msg.image} alt="Generated" className="generated-image" />
                <a href={msg.image} download="generated-image.png">
                  <button className="download-button">Download</button>
                </a>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="loader">
            {mode === "image-generation" ? (
              <div>
                <p>Generating Image... {Math.round(progress)}%</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="spinner"></div>
            )}
          </div>
        )}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
