import {useRef, useEffect, useState} from "react";

import '../CSS/ChatBot.css';
import PropTypes from "prop-types";
import {submitChat} from "../chat.js";
import {v4 as uuidv4} from 'uuid';
import {parseResponseWithSources} from "../utils/responseParser.js";
import SourceDetails from "./SourceDetails.jsx";


const Chatbot = ({ onClose }) => {
    Chatbot.propTypes = {
        onClose: PropTypes.func.isRequired,
    };
    const sessionId = localStorage.getItem('sessionId')
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedSource, setSelectedSource] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const bottomRef = useRef(null); //
    const sampleQuestions = [
        "What is Om's educational background?",
        "Tell me about Om's projects.",
        "What are Om's skills in AI/ML?",
        "Can you guide me to the experience section?",
    ];

    useEffect(() => {
        if(bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);


    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        if (showSuggestions) setShowSuggestions(false);

        try {
          const response = await submitChat(sessionId, input);

          // Parse the response to extract sources
          const parsedResponse = parseResponseWithSources(response['response']);
          
          const modelMessage = { 
            role: "model", 
            content: parsedResponse.text,
            sources: parsedResponse.sources,
            rawContent: response['response']
          };
          setMessages((prev) => [...prev, modelMessage]);
        } catch (error) {
          console.error("Error sending message:", error);
        }
    };

    const handleSampleQuestionClick = (question) => {
        setInput(question);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    const handleSourceClick = (source) => {
        setSelectedSource(source);
    };

    const closeSourceDetails = () => {
        setSelectedSource(null);
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h3>Jarvis</h3>
                <button className="close-button" onClick={onClose}>
                    X
                </button>
            </div>
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.role === "user" ? "user" : "model"}`} >
                        <p>{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="message-sources">
                                <small>
                                    Sources: {msg.sources.map(source => 
                                        <span 
                                            key={source.id} 
                                            className="source-reference"
                                            onClick={() => handleSourceClick(source)}
                                            title="Click for source details"
                                        >
                                            {source.label}
                                        </span>
                                    ).join(', ')}
                                </small>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} /> {/* Empty div to scroll into view */}
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about Om.."
                />
                <button onClick={() => handleSendMessage()}>Send</button>
            </div>
            {showSuggestions && (
                <div className="chatbot-sample-questions">
                    <p>Try asking:</p>
                    {sampleQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="sample-question-button"
                            onClick={() => handleSampleQuestionClick(question)}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            )}
            
            {selectedSource && (
                <SourceDetails 
                    source={selectedSource} 
                    onClose={closeSourceDetails} 
                />
            )}
        </div>
    );
};

export default Chatbot;

