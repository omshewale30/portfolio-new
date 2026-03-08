// src/components/GlobalChatbot.jsx
"use client";
import { useState, useEffect } from "react";
import ChatBot from "./ChatBot";
import { FaRobot } from "react-icons/fa"; // Use a modern icon

const GlobalChatbot = () => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [showHint, setShowHint] = useState(true);

    useEffect(() => {
        const hintTimer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(hintTimer);
    }, []);
    const toggleChatbot = () => {
        setIsChatbotOpen((prevState) => !prevState);
    };


    return (

        <div className="pointer-events-none fixed bottom-5 right-5 z-[1000]">
            {showHint && (
                <div className="pointer-events-auto absolute -top-20 right-0 max-w-[290px] rounded-[12px_12px_0_12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-2 text-left text-sm text-[var(--color-text-muted)] shadow-[var(--shadow-glass)] animate-[bounce_1s_ease-in-out_infinite_alternate]">
                   💬 Need help? Try chatting with me to learn more about Om!
                </div>
            )}
            <button
                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-xl text-[var(--color-primary)] shadow-[var(--shadow-glass)] transition-all duration-300 hover:scale-105 hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-primary-hover)] sm:h-[70px] sm:w-[70px]"
                onClick={() => toggleChatbot()}
                title="Chat with me"
            >
                <FaRobot />
            </button>
            {isChatbotOpen && (
                <ChatBot onClose={() => setIsChatbotOpen(false)} />
                )}
        </div>
    );
};

export default GlobalChatbot;

