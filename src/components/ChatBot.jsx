import { useRef, useEffect, useState, Fragment } from "react";
import PropTypes from "prop-types";
import {submitChat} from "../chat.js";
import {parseResponseWithSources} from "../utils/responseParser.js";
import SourceDetails from "./SourceDetails.jsx";


const Chatbot = ({ onClose }) => {
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
        setShowSuggestions(false);

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
        setShowSuggestions(false);
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
        <div className="fixed bottom-24 right-4 z-[1100] flex h-[70vh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-glass-strong)] sm:right-5 sm:h-[600px] sm:w-[400px]">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 text-[var(--color-text-primary)]">
                <h3 className="m-0 font-display text-[1.3rem] italic">Jarvis</h3>
                <button className="text-2xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]" onClick={onClose}>
                    ×
                </button>
            </div>
            <div className="flex min-h-[200px] flex-1 flex-col gap-3 overflow-y-auto bg-[var(--color-bg-base)] px-4 pb-2 pt-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`my-1 max-w-[90%] rounded-3xl border px-4 py-3 text-sm shadow-sm ${
                          msg.role === "user"
                            ? "self-end border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg-base)]"
                            : "self-start border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]"
                        }`}
                    >
                        <p className="m-0">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 border-t border-[var(--color-border-muted)] pt-2 text-xs text-[var(--color-text-subtle)]">
                                <small className="block leading-snug">
                                    Sources:{" "}
                                    {msg.sources.map((source, sourceIndex) => (
                                      <Fragment key={source.id}>
                                        <button
                                          className="mx-0.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                                          onClick={() => handleSourceClick(source)}
                                          title="Click for source details"
                                        >
                                          {source.label}
                                        </button>
                                        {sourceIndex < msg.sources.length - 1 ? ", " : null}
                                      </Fragment>
                                    ))}
                                </small>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} /> {/* Empty div to scroll into view */}
            </div>
            <div className="flex gap-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything about Om.."
                    className="flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[rgba(200,168,130,0.2)]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="rounded-xl bg-[var(--color-primary)] px-4 py-2 font-mono text-sm font-medium uppercase tracking-[0.06em] text-[var(--color-bg-base)] shadow-[var(--shadow-button)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)]"
                >
                  Send
                </button>
            </div>
            {showSuggestions && (
                <div className="relative flex h-[30%] min-h-[120px] flex-col gap-1 overflow-y-auto border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.25)] sm:min-h-[150px]">
                    <p className="m-0 font-mono text-sm uppercase tracking-[0.08em] text-[var(--color-text-meta)]">Try asking:</p>
                    {sampleQuestions.map((question, index) => (
                        <button
                            key={index}
                            className="w-fit rounded-xl border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] px-3 py-1 text-left text-xs text-[var(--color-text-muted)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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

Chatbot.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default Chatbot;

