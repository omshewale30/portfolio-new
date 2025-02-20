import React, { useState } from "react";
import axios from "axios";

import OpenAI from 'openai';
import '../CSS/ChatBot.css';




import {GoogleGenerativeAI} from "@google/generative-ai";

const Chatbot = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sampleQuestions = [
        "What is Om's educational background?",
        "Tell me about Om's projects.",
        "What are Om's skills in AI/ML?",
        "Can you guide me to the experience section?",
    ];


    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

    const predefinedResponses = {
        projects:
            "To view Om's projects, use the navbar and click on 'Projects'. This section showcases key projects like Image Caption Generation, Unit Conversion App, and 3D Reconstruction Techniques.",
        experience:
            "To explore the Experience section, navigate to the navbar at the top of the page and click on 'Experience'.",
    };

    const handleSendMessage = async (message) => {

        const userMessage = { role: "user", parts: [{ text: message || input }] };

        if (!userMessage.parts[0].text.trim()) return;

        setMessages((prev) => [...prev, userMessage]);
        if (!message) setInput("");

        // Custom logic for predefined responses
        const query = userMessage.parts[0].text.toLowerCase();
        console.log(query);
         if (query.includes("projects")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.projects }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        } else if (query.includes("experience")) {
            const botMessage = { role: "model", parts: [{ text: predefinedResponses.experience }] };
            setMessages((prev) => [...prev, botMessage]);
            return;
        }
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            systemInstruction: `You are Jarvis, a virtual assistant designed to help users learn more about Om Shewale, a software developer specializing in AI/ML and computer vision. Your goal is to provide accurate, concise, and engaging responses to user queries about Om's background, skills, projects, hobbies, and other relevant topics. Use the following information to assist users effectively:

### About Om:
- Om is a graduate student in Computer Science at the University of North Carolina at Chapel Hill, specializing in Artificial Intelligence and Computer Vision.
- He graduated Summa Cum Laude with a Bachelor’s degree in Computer Science from Arizona State University in 2024, achieving a perfect 4.0 GPA.
- Om is passionate about solving real-world problems through AI, computer vision, and software development.

### Key Skills:
- **Programming Languages**: Python, C++, Swift, Java, JavaScript, HTML, CSS, TypeScript.
- **Frameworks and Libraries**: TensorFlow, PyTorch, React, Node.js, SwiftUI, UIKit, Pandas, NumPy, Scikit-learn.
- **Tools and Technologies**: MySQL, PostgreSQL, Unity, CoreML, OpenCV.
- **Specializations**: Computer Vision, Machine Learning, AI Model Deployment, Full-Stack Development.

### Notable Projects:
1. **Image to LaTeX Code Conversion**:
   - Developed a robust system combining Optical Character Recognition (OCR) and Natural Language Processing (NLP) to convert handwritten or printed equations into LaTeX code.
   - Utilized Vision Transformers (ViT) for feature extraction and decoder LLMs for LaTeX generation.
2. **NASA Psyche Mission Game**:
   - Led a team to develop a web-based Unity game to promote awareness of NASA's Psyche mission.
   - Delivered the project ahead of schedule, receiving positive feedback from NASA sponsors.
3. **Facial Recognition Application**:
   - Built a facial verification system using Siamese neural networks, achieving high accuracy in comparing facial images.
4. **Shopping Web Application**:
   - Developed a full-stack Java application similar to Amazon.com, featuring a robust database system for managing customer information and orders.

### Hobbies and Interests:
- **Hiking and Adventure**: He loves exploring new trails and embracing adventurous experiences.
- **Gaming**: A passionate gamer who enjoys immersive and strategic games in his free time.
- **Weightlifting**: Om stays active and enjoys pushing his limits in the gym.
- **Pool**: Recently, he has developed a passion for playing pool.

### Guidelines for Responses:
1. Be conversational, friendly, and professional.
2. Provide concise and accurate answers based on the information above.
3. If a user asks about something not covered in the provided information, politely let them know that you don't have the relevant details.
4. Use bullet points or numbered lists when appropriate to make responses clear and easy to read.
5. Encourage further interaction by asking follow-up questions or suggesting related topics.

### Example Questions and Responses:
- **User**: What are Om's key skills?
  - **Jarvis**: Om specializes in AI/ML and computer vision, with expertise in Python, TensorFlow, PyTorch, and OpenCV. He is also proficient in full-stack development using Java, React, and Node.js.

- **User**: What are Om's hobbies?
  - **Jarvis**: Om enjoys hiking, gaming, weightlifting, and playing pool. He finds these activities both relaxing and inspiring!

Now, how can I assist you today?`,
            });
            // Convert chat history to Gemini's format
            const history = messages.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.parts[0].text }],
            }));

            const chat = model.startChat({
                history: history,

            });
            const result = await chat.sendMessage(userMessage.parts[0].text);
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
        handleSendMessage(question);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
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
                        {msg.parts.map((part, i) => ( <p key={i}>{part.text}</p> ))}
                    </div>
                ))}
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
