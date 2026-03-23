import { useRef, useEffect, useState, Fragment, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { Send, Terminal, Sparkles, Minus, Maximize2, X } from "lucide-react";
import { submitChat } from "../chat.js";
import { parseResponseWithSources } from "../utils/responseParser.js";
import SourceDetails from "./SourceDetails.jsx";

const Chatbot = ({ onClose, embedded = false, terminal = false, className = "" }) => {
    const sessionId = localStorage.getItem("sessionId");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const [selectedSource, setSelectedSource] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDetached, setIsDetached] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);
    const floatingRef = useRef(null);
    const placeholderRef = useRef(null);

    const sampleQuestions = [
        "What are Om's AI/ML skills?",
        "Tell me about his projects",
        "Work experience?",
    ];

    const hasInteracted = messages.length > 0 || isLoading;

    useEffect(() => {
        if (messagesContainerRef.current && isExpanded && !isMinimized) {
            const container = messagesContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, isExpanded, isMinimized]);

    useEffect(() => {
        if (hasInteracted && !isExpanded) {
            setIsExpanded(true);
        }
    }, [hasInteracted, isExpanded]);

    useEffect(() => {
        if (isDetached && placeholderRef.current) {
            const rect = placeholderRef.current.getBoundingClientRect();
            setPosition({
                x: window.innerWidth - 460,
                y: Math.max(80, rect.top),
            });
        }
    }, [isDetached]);

    const handleMouseDown = useCallback((e) => {
        if (!floatingRef.current) return;
        const rect = floatingRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const newX = Math.max(0, Math.min(window.innerWidth - 440, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleDetach = () => {
        if (isDetached) {
            setIsDetached(false);
            setIsMinimized(false);
        } else {
            setIsDetached(true);
            setIsMinimized(false);
        }
    };

    const handleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    const handleCloseTerminal = () => {
        setMessages([]);
        setInput("");
        setIsExpanded(false);
        setIsDetached(false);
        setIsMinimized(false);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setIsExpanded(true);

        try {
            const response = await submitChat(sessionId, input);
            const parsedResponse = parseResponseWithSources(response["response"]);

            const modelMessage = {
                role: "model",
                content: parsedResponse.text,
                sources: parsedResponse.sources,
                rawContent: response["response"],
            };
            setMessages((prev) => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", content: "Sorry, something went wrong. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleQuestionClick = (question) => {
        setInput(question);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSourceClick = (source) => {
        setSelectedSource(source);
    };

    const closeSourceDetails = () => {
        setSelectedSource(null);
    };

    if (terminal) {
        const terminalContent = (
            <div
                ref={isDetached ? floatingRef : null}
                className={`overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[rgba(22,18,13,0.95)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ${
                    isDetached ? "w-[420px]" : "w-full"
                } ${isDragging ? "cursor-grabbing" : ""}`}
                style={
                    isDetached
                        ? {
                              position: "fixed",
                              left: position.x,
                              top: position.y,
                              zIndex: 9999,
                              transform: isDragging ? "scale(1.02)" : "scale(1)",
                          }
                        : {}
                }
            >
                {/* Terminal header - draggable when detached */}
                <div
                    className={`flex items-center justify-between border-b border-[var(--color-border-muted)] bg-[rgba(30,24,16,0.98)] px-4 py-2.5 ${
                        isDetached ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                    onMouseDown={isDetached ? handleMouseDown : undefined}
                >
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <button
                                onClick={handleCloseTerminal}
                                className="group relative h-3 w-3 rounded-full bg-[#ff5f57] transition-all hover:brightness-110"
                                title="Close"
                            >
                                <X
                                    size={8}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#4a0002] opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </button>
                            <button
                                onClick={handleMinimize}
                                className="group relative h-3 w-3 rounded-full bg-[#febc2e] transition-all hover:brightness-110"
                                title={isMinimized ? "Expand" : "Minimize"}
                            >
                                <Minus
                                    size={8}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#985700] opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </button>
                            <button
                                onClick={handleDetach}
                                className="group relative h-3 w-3 rounded-full bg-[#28c840] transition-all hover:brightness-110"
                                title={isDetached ? "Dock" : "Pop out"}
                            >
                                <Maximize2
                                    size={7}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#006500] opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </button>
                        </div>
                        <div className="ml-2 flex items-center gap-1.5">
                            <Terminal size={12} className="text-[var(--color-primary)] opacity-70" />
                            <span className="font-mono text-[11px] tracking-wide text-[var(--color-text-meta)]">
                                jarvis ~ {isDetached ? "floating" : "docked"}
                            </span>
                        </div>
                    </div>
                    {isDetached && (
                        <span className="font-mono text-[10px] text-[var(--color-text-subtle)] opacity-60">
                            drag to move
                        </span>
                    )}
                </div>

                {/* Messages area - animated height */}
                <div
                    className="transition-all duration-500 ease-out"
                    style={{
                        maxHeight: isMinimized ? "0px" : isExpanded ? (isDetached ? "400px" : "320px") : "0px",
                        opacity: isMinimized ? 0 : isExpanded ? 1 : 0,
                    }}
                >
                    <div
                        ref={messagesContainerRef}
                        className={`flex flex-col gap-3 overflow-y-auto px-4 py-4 ${
                            isDetached ? "max-h-[400px]" : "max-h-[320px]"
                        }`}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-[var(--color-primary)] text-[var(--color-bg-base)]"
                                            : "border border-[var(--color-border-subtle)] bg-[rgba(40,32,22,0.8)] text-[var(--color-text-muted)]"
                                    }`}
                                >
                                    <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1 border-t border-[var(--color-border-muted)] pt-2">
                                            {msg.sources.map((source, sourceIndex) => (
                                                <Fragment key={source.id}>
                                                    <button
                                                        className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)]"
                                                        onClick={() => handleSourceClick(source)}
                                                    >
                                                        {source.label}
                                                    </button>
                                                    {sourceIndex < msg.sources.length - 1 ? " " : null}
                                                </Fragment>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border-subtle)] bg-[rgba(40,32,22,0.8)] px-5 py-3.5">
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:0ms]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:150ms]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:300ms]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input area */}
                <div
                    className="border-t border-[var(--color-border-muted)] bg-[rgba(26,21,14,0.98)] p-3 transition-all duration-300"
                    style={{
                        maxHeight: isMinimized ? "0px" : "200px",
                        opacity: isMinimized ? 0 : 1,
                        padding: isMinimized ? "0 12px" : "12px",
                        overflow: "hidden",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[var(--color-primary)]">›</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything about Om..."
                            disabled={isLoading}
                            className="flex-1 bg-transparent font-mono text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-subtle)] outline-none disabled:opacity-50"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-bg-base)] transition-all hover:scale-105 hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:hover:scale-100"
                        >
                            <Send size={14} />
                        </button>
                    </div>

                    {/* Quick prompts - visible when not expanded */}
                    <div
                        className="mt-3 flex flex-wrap gap-2 transition-all duration-300"
                        style={{
                            maxHeight: !isExpanded ? "100px" : "0px",
                            opacity: !isExpanded ? 1 : 0,
                            overflow: "hidden",
                        }}
                    >
                        {sampleQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleSampleQuestionClick(question)}
                                className="group flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[rgba(200,168,130,0.06)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                            >
                                <Sparkles size={10} className="opacity-50 group-hover:opacity-100" />
                                {question}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedSource && (
                    <SourceDetails source={selectedSource} onClose={closeSourceDetails} />
                )}
            </div>
        );

        return (
            <div ref={placeholderRef} className={`relative w-full ${className}`.trim()}>
                {isDetached ? (
                    <>
                        {/* Placeholder when detached */}
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[rgba(22,18,13,0.4)] px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Terminal size={14} className="text-[var(--color-primary)] opacity-50" />
                                <span className="font-mono text-xs text-[var(--color-text-subtle)]">
                                    Terminal floating — click green button to dock
                                </span>
                            </div>
                            <button
                                onClick={handleDetach}
                                className="rounded-lg border border-[var(--color-border-subtle)] bg-[rgba(200,168,130,0.1)] px-3 py-1.5 font-mono text-xs text-[var(--color-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[rgba(200,168,130,0.15)]"
                            >
                                Dock Terminal
                            </button>
                        </div>
                        {createPortal(terminalContent, document.body)}
                    </>
                ) : (
                    terminalContent
                )}
            </div>
        );
    }

    const containerClassName = embedded
        ? "relative z-10 flex h-[460px] w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-glass)] md:h-[500px]"
        : "fixed bottom-24 right-4 z-[1100] flex h-[70vh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-glass-strong)] sm:right-5 sm:h-[600px] sm:w-[400px]";

    return (
        <div className={`${containerClassName} ${className}`.trim()}>
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 text-[var(--color-text-primary)]">
                <h3 className="m-0 font-display text-[1.3rem] italic">Jarvis</h3>
                {onClose ? (
                    <button
                        className="text-2xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                        onClick={onClose}
                    >
                        ×
                    </button>
                ) : null}
            </div>
            <div ref={messagesContainerRef} className="flex min-h-[200px] flex-1 flex-col gap-3 overflow-y-auto bg-[var(--color-bg-base)] px-4 pb-2 pt-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`my-1 max-w-[90%] rounded-3xl border px-5 py-4 text-sm shadow-sm ${
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
                {isLoading && (
                    <div className="my-1 flex max-w-[90%] items-center gap-2 self-start rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 py-4">
                        <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)] [animation-delay:300ms]" />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything about Om.."
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[rgba(200,168,130,0.2)] disabled:opacity-50"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl bg-[var(--color-primary)] px-4 py-2 font-mono text-sm font-medium uppercase tracking-[0.06em] text-[var(--color-bg-base)] shadow-[var(--shadow-button)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    Send
                </button>
            </div>
            {!hasInteracted && (
                <div className="relative flex min-h-[120px] flex-col gap-1 overflow-y-auto border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.25)] sm:min-h-[150px]">
                    <p className="m-0 font-mono text-sm uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                        Try asking:
                    </p>
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

            {selectedSource && <SourceDetails source={selectedSource} onClose={closeSourceDetails} />}
        </div>
    );
};

Chatbot.propTypes = {
    onClose: PropTypes.func,
    embedded: PropTypes.bool,
    terminal: PropTypes.bool,
    className: PropTypes.string,
};

export default Chatbot;

