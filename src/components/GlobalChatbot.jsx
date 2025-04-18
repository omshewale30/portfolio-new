// src/components/GlobalChatbot.jsx
"use client";
import { useState, useEffect } from "react";
import ChatBot from "./ChatBot";
import { FaRobot } from "react-icons/fa"; // Use a modern icon
import '../CSS/ChatBot.css';

const GlobalChatbot = () => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [showHint, setShowHint] = useState(true);

    useEffect(() => {
        const hintTimer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(hintTimer);
    }, []);
    const toggleChatbot = () => {
        console.log("Toggling Chatbot, Current State:", isChatbotOpen);  // Debug log
        setIsChatbotOpen((prevState) => !prevState);
    };


    return (

        <div className="global-chatbot-container">
            {showHint && (
                <div className="chatbot-hint visible">
                   💬 Need help? Try chatting with me to learn more about Om!
                </div>
            )}
            <button
                className="chatbot-toggle" onClick={() => toggleChatbot()} title="Chat with me">
                <FaRobot />
            </button>
            {isChatbotOpen && (
                <div className="chatbot-wrapper">
                <ChatBot onClose={() => setIsChatbotOpen(false)} />
            </div>
                )}
        </div>
    );
};

export default GlobalChatbot;

