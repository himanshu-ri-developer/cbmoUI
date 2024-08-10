import React, { useState } from 'react';
import axios from 'axios';

const ChatBox = () => {
  const [messages, setMessages] = useState([{ text: "Hello", from: "system" }]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("text-generation");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [outputFormat, setOutputFormat] = useState("webp");
  const [numOutputs, setNumOutputs] = useState(1);

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
      } else if (mode === "flux-image-generation") {
        const interval = setInterval(() => {
          setProgress((oldProgress) => {
            if (oldProgress === 100) {
              clearInterval(interval);
              return 100;
            }
            return Math.min(oldProgress + Math.random() * 10, 100);
          });
        }, 500);

        const response = await axios.post('http://localhost:5000/flux-image-generation', {
          prompt: input,
          num_outputs: numOutputs,
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
          output_quality: 90
        }, { responseType: 'blob' });

        const images = [];
        for (let i = 0; i < numOutputs; i++) {
          const imageUrl = URL.createObjectURL(new Blob([response.data], { type: `image/${outputFormat}` }));
          images.push({
            image: imageUrl,
            from: "system",
          });
        }

        setMessages((prevMessages) => [...prevMessages, ...images]);
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
          DallE-3 Image Generation
        </label>
        <label>
          <input
            type="radio"
            value="flux-image-generation"
            checked={mode === "flux-image-generation"}
            onChange={handleModeChange}
          />
          Image Generation with Flux
        </label>
      </div>
      {mode === "flux-image-generation" && (
        <div className="flux-options">
          <label>
            Aspect Ratio:
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
              {["1:1", "16:9", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"].map((ratio) => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </label>
          <label>
            Output Format:
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              {["webp", "jpg", "png"].map((format) => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </label>
          <label>
            Number of Outputs:
            <input
              type="number"
              value={numOutputs}
              onChange={(e) => setNumOutputs(e.target.value)}
              min="1"
              max="10"
            />
          </label>
        </div>
      )}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from}`}>
            {msg.text && <div dangerouslySetInnerHTML={{ __html: msg.text }} className="formatted-text" />}
            {msg.image && (
              <div className="image-message">
                <img src={msg.image} alt="Generated" className="generated-image" />
                <a href={msg.image} download={`generated-image.${outputFormat}`}>
                  <button className="download-button">Download</button>
                </a>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="loader">
            {mode === "image-generation" || mode === "flux-image-generation" ? (
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
