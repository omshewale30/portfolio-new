import React, { useState } from "react";
import axios from "axios";
import "/src/CSS/Chatbot.css";
import OpenAI from 'openai';




import {GoogleGenerativeAI} from "@google/generative-ai";

const Chatbot = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sampleQuestions = [
        "What is Om's educational background?",
        "Tell me about Om's projects.",
        "What are Om's skills in AI/ML?",
        "Does Om have any certifications?",
        "Can you guide me to the experience section?",
    ];


    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

    const predefinedResponses = {
        gallery:
            "To view Sankalp's gallery, use the navbar and click on 'Gallery'. This section showcases stunning visuals and highlights from Sankalp's personal and professional projects, including his wildlife photography collection.",
        projects:
            "To view Sankalp's projects, use the navbar and click on 'Projects'. This section showcases key projects like Image Caption Generation, Unit Conversion App, and 3D Reconstruction Techniques.",
        certifications:
            "To find certifications, go to the navbar and click on 'Certificates'.",
        experience:
            "To explore the Experience section, navigate to the navbar at the top of the page and click on 'Experience'.",
        hobbies:
            "Sankalp's hobbies include:\n1. **Wildlife Photography**: He enjoys capturing the beauty of nature and wildlife through his lens.\n2. **Hiking and Adventure**: He loves exploring new trails and embracing adventurous experiences.\n3. **Gaming**: A passionate gamer who enjoys immersive and strategic games in his free time.",
    };

    const handleSendMessage = async (message) => {

        const userMessage = { role: "user", parts: [{ text: message || input }] };
        if (!userMessage.content.trim()) return;

        setMessages((prev) => [...prev, userMessage]);
        if (!message) setInput("");

        // Custom logic for predefined responses
        const query = userMessage.parts[0].text.toLowerCase();
        if (query.includes("gallery")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.gallery }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        } else if (query.includes("projects")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.projects }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        } else if (query.includes("certifications")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.certifications }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        } else if (query.includes("experience")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.experience }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        } else if (query.includes("hobbies") || query.includes("interests")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.hobbies }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        }


        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            // Convert chat history to Gemini's format
            const history = messages.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.parts[0].text }],
            }));

            const chat = model.startChat({
                history: history,
            });
            const result = await chat.sendMessage(userMessage.parts[0].text);;
            console.log(result.response.text());
            const botMessage = { role: "model", parts: [{ text: result.response.text() }] };
            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            const errorMessage = {
                role: "model",
                parts: [{ text: "Sorry, I couldn't process your request. Please try again later." }],
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleSampleQuestionClick = (question) => {
        handleSendMessage(question).then(r => console.log(r));
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage().then(r => console.log(r));
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h3>Chatbot</h3>
                <button className="close-button" onClick={onClose}>
                    X
                </button>
            </div>
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.role === "user" ? "user" : "assistant"}`}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about Sankalp..."
                />
                <button onClick={() => handleSendMessage()}>Send</button>
            </div>
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
        </div>
    );
};

export default Chatbot;
