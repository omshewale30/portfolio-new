import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Circle, LoaderCircle, RotateCcw, Waypoints, X } from "lucide-react";
import { submitChat } from "../chat.js";
import SourceDetails from "./SourceDetails.jsx";

const CHAT_STORAGE_KEY = "portfolio-jarvis-chat-v3";
const STEP_MS = 560;
const TYPE_MS = 18;
const TYPE_CHARS = 3;

const SAMPLE_QUESTIONS = [
    "What is Om building right now?",
    "Why does most enterprise AI disappoint?",
    "Can a model decide without reasoning?",
];

const SITE_URL = /^https?:\/\/(www\.)?omshewale\.(me|com)(?=\/|$)/i;

// Answers are markdown. Links to this site stay in the app; anything else opens in a new tab.
const AnswerLink = ({ href = "", children }) => {
    const path = href.replace(SITE_URL, "") || "/";
    return SITE_URL.test(href) ? (
        <Link to={path}>{children}</Link>
    ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
};

AnswerLink.propTypes = {
    href: PropTypes.string,
    children: PropTypes.node,
};

const ANSWER_COMPONENTS = { a: AnswerLink };

// Mid-typing, half-typed markdown would flash its syntax: show a partial [link](url) as its
// text, and close an open **bold**, until the rest arrives.
const typingMarkdown = (text) => {
    const base = text
        .replace(/\*+$/, "")
        .replace(/\[([^\]]*)\](\([^)]*)?$/, "$1")
        .replace(/\[([^\]]*)$/, "$1");
    if ((base.match(/\*\*/g) || []).length % 2 === 0) return base;
    // A closing ** only counts directly after text, so it goes before any trailing space.
    const trimmed = base.trimEnd();
    return `${trimmed}**${base.slice(trimmed.length)}`;
};

const newSessionId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const loadChatSession = () => {
    const fallback = { sessionId: newSessionId(), previousResponseId: null, exchange: null };
    if (typeof window === "undefined") return fallback;

    try {
        const stored = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
        if (!stored) return fallback;
        const parsed = JSON.parse(stored);
        const exchange = parsed.exchange;
        return {
            sessionId: typeof parsed.sessionId === "string" ? parsed.sessionId : fallback.sessionId,
            previousResponseId:
                typeof parsed.previousResponseId === "string" ? parsed.previousResponseId : null,
            exchange:
                exchange && typeof exchange.question === "string" && typeof exchange.answer === "string"
                    ? exchange
                    : null,
        };
    } catch {
        return fallback;
    }
};

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formatLatency = (latencyMs) => {
    if (!Number.isFinite(latencyMs)) return null;
    return `${(latencyMs / 1000).toFixed(1)}s`;
};

const formatCost = (costUsd) => {
    if (!Number.isFinite(costUsd)) return "cost n/a";
    if (costUsd > 0 && costUsd < 0.0001) return "<$0.0001";
    return `$${costUsd.toFixed(4)}`;
};

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// The steps before the API answers: what we know is happening while the request is in flight.
const requestSteps = (question, isFollowUp) => [
    {
        label: "Parse intent",
        detail: `${countWords(question)} words · ${isFollowUp ? "follow-up" : "new thread"}`,
    },
    { label: "Search knowledge base", detail: "file search · Om's documents" },
];

// The steps the response lets us show: each cited document, then the answer itself.
const responseSteps = (exchange) => {
    const sources = exchange.sources ?? [];
    const reads = sources.length
        ? sources.slice(0, 3).map((source) => ({
              label: `Read ${source.filename}`,
              detail: source.quote ? `“${truncate(source.quote, 44)}”` : "cited",
          }))
        : [{ label: "Draw on context", detail: "no documents cited" }];
    const extra = sources.length > 3 ? ` (+${sources.length - 3} more)` : "";
    return [
        ...reads,
        {
            label: "Compose answer",
            detail: `${sources.length} source${sources.length === 1 ? "" : "s"}${extra} · ${
                sources.length ? "grounded" : "ungrounded"
            }`,
        },
    ];
};

const allSteps = (exchange, isFollowUp) =>
    exchange.error
        ? requestSteps(exchange.question, isFollowUp)
        : [...requestSteps(exchange.question, isFollowUp), ...responseSteps(exchange)];

const STATUS_LABEL = {
    idle: "ready",
    thinking: "thinking…",
    reading: "reading…",
    answering: "writing…",
    done: "answered",
    error: "error",
};

const StepMark = ({ state }) => {
    const ring = {
        done: "border-[var(--color-accent)] text-[var(--color-accent)]",
        active: "border-[var(--color-border-hover)] text-[var(--color-text-primary)]",
        failed: "border-[var(--color-border-hover)] text-[var(--color-text-subtle)]",
        pending: "border-[var(--color-border-subtle)] text-[var(--color-text-meta)]",
    }[state];

    return (
        <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border ${ring}`}>
            {state === "done" ? <Check size={12} aria-hidden="true" /> : null}
            {state === "active" ? <LoaderCircle size={12} className="spin-step" aria-hidden="true" /> : null}
            {state === "failed" ? <X size={12} aria-hidden="true" /> : null}
            {state === "pending" ? <Circle size={10} aria-hidden="true" /> : null}
        </span>
    );
};

StepMark.propTypes = {
    state: PropTypes.oneOf(["done", "active", "failed", "pending"]).isRequired,
};

const Chatbot = ({ className = "" }) => {
    const [initialSession] = useState(loadChatSession);
    const [sessionId] = useState(initialSession.sessionId);
    const [previousResponseId, setPreviousResponseId] = useState(initialSession.previousResponseId);
    const [exchange, setExchange] = useState(initialSession.exchange);
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [phase, setPhase] = useState(
        initialSession.exchange ? (initialSession.exchange.error ? "error" : "done") : "idle",
    );
    const [doneCount, setDoneCount] = useState(
        initialSession.exchange ? allSteps(initialSession.exchange, false).length : 0,
    );
    const [shown, setShown] = useState(initialSession.exchange?.answer.length ?? 0);
    const [input, setInput] = useState("");

    const timers = useRef([]);
    const requestId = useRef(0);

    const clearTimers = useCallback(() => {
        timers.current.forEach((timer) => {
            window.clearTimeout(timer);
            window.clearInterval(timer);
        });
        timers.current = [];
    }, []);

    useEffect(() => clearTimers, [clearTimers]);

    useEffect(() => {
        try {
            window.sessionStorage.setItem(
                CHAT_STORAGE_KEY,
                JSON.stringify({
                    sessionId,
                    previousResponseId,
                    exchange: phase === "done" || phase === "error" ? exchange : null,
                }),
            );
        } catch {
            // Storage can be unavailable (private mode); the chat still works without persistence.
        }
    }, [sessionId, previousResponseId, exchange, phase]);

    const typeAnswer = useCallback(
        (answer) => {
            if (prefersReducedMotion()) {
                setShown(answer.length);
                setPhase("done");
                return;
            }
            setPhase("answering");
            setShown(0);
            let count = 0;
            const interval = window.setInterval(() => {
                count = Math.min(answer.length, count + TYPE_CHARS);
                setShown(count);
                if (count >= answer.length) {
                    window.clearInterval(interval);
                    setPhase("done");
                }
            }, TYPE_MS);
            timers.current.push(interval);
        },
        [],
    );

    // Walk the reasoning graph from its current position to the end, then type the answer.
    const revealResponse = useCallback(
        (next, followUp) => {
            const total = allSteps(next, followUp).length;
            const start = requestSteps(next.question, followUp).length;
            if (prefersReducedMotion()) {
                setDoneCount(total);
                typeAnswer(next.answer);
                return;
            }
            for (let index = start + 1; index <= total; index += 1) {
                timers.current.push(
                    window.setTimeout(() => setDoneCount(index), (index - start) * STEP_MS),
                );
            }
            timers.current.push(
                window.setTimeout(() => typeAnswer(next.answer), (total - start) * STEP_MS + 250),
            );
        },
        [typeAnswer],
    );

    const ask = async (rawQuestion) => {
        const question = rawQuestion.trim();
        if (!question || phase === "thinking" || phase === "reading" || phase === "answering") return;

        clearTimers();
        const id = (requestId.current += 1);
        const followUp = Boolean(previousResponseId);
        setIsFollowUp(followUp);
        setInput("");
        setShown(0);
        setExchange({ question, answer: "", sources: [] });
        setPhase("thinking");
        setDoneCount(1);

        try {
            const response = await submitChat(sessionId, question, previousResponseId);
            if (id !== requestId.current) return;

            const next = {
                question,
                answer: typeof response.response === "string" ? response.response : "",
                sources: Array.isArray(response.sources) ? response.sources : [],
                latencyMs: Number.isFinite(response.latency_ms) ? response.latency_ms : null,
                costUsd: Number.isFinite(response.cost_usd) ? response.cost_usd : null,
                usage: response.usage ?? null,
                model: typeof response.model === "string" ? response.model : null,
            };
            setPreviousResponseId(response.response_id ?? null);
            setExchange(next);
            setDoneCount(requestSteps(question, followUp).length);
            setPhase("reading");
            revealResponse(next, followUp);
        } catch (error) {
            if (id !== requestId.current) return;
            console.error("Error sending message:", error);
            const expired = error.code === "conversation_expired";
            if (expired) setPreviousResponseId(null);
            setExchange({
                question,
                answer: expired
                    ? "That conversation expired. I cleared it, so please ask again."
                    : "Something went wrong reaching Jarvis. Please try again.",
                sources: [],
                error: true,
            });
            setDoneCount(1);
            setShown(Number.MAX_SAFE_INTEGER);
            setPhase("error");
        }
    };

    const reset = () => {
        clearTimers();
        requestId.current += 1;
        setPreviousResponseId(null);
        setExchange(null);
        setPhase("idle");
        setDoneCount(0);
        setShown(0);
        setInput("");
    };

    const busy = phase === "thinking" || phase === "reading" || phase === "answering";
    const steps = exchange ? (phase === "thinking" ? requestSteps(exchange.question, isFollowUp) : allSteps(exchange, isFollowUp)) : [];
    const visibleSteps = phase === "thinking" || phase === "error" ? steps : steps.slice(0, Math.min(doneCount + 1, steps.length));
    const stepState = (index) => {
        if (phase === "error" && index === 1) return "failed";
        if (index < doneCount) return "done";
        if (busy && index === doneCount) return "active";
        return "pending";
    };
    const showAnswer = phase === "answering" || phase === "done" || phase === "error";
    const usage = exchange?.usage;
    const meta = exchange && !exchange.error
        ? [
              formatLatency(exchange.latencyMs),
              formatCost(exchange.costUsd),
              Number.isFinite(usage?.total_tokens) ? `${usage.total_tokens.toLocaleString()} tok` : null,
          ]
              .filter(Boolean)
              .join(" · ")
        : "";

    return (
        <div
            className={`grid overflow-hidden rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,1.1fr)] ${className}`.trim()}
        >
            {/* Ask */}
            <div className="flex flex-col gap-3.5 border-b border-[var(--color-border-subtle)] p-[22px] lg:border-b-0 lg:border-r">
                <h2 className="m-0 flex items-center gap-2 text-[13px] font-normal text-[var(--color-text-primary)]">
                    <Waypoints size={17} className="text-[var(--color-text-subtle)]" aria-hidden="true" />
                    Jarvis
                    <span className="ml-auto font-mono text-[11px] text-[var(--color-text-meta)]" aria-live="polite">
                        {STATUS_LABEL[phase]}
                    </span>
                </h2>
                <p className="m-0 text-[13px] leading-normal text-[var(--color-text-subtle)]">
                    Ask anything about my work. The middle panel shows how the answer is assembled.
                </p>
                <div className="flex flex-col gap-1.5">
                    {SAMPLE_QUESTIONS.map((question) => (
                        <button
                            key={question}
                            type="button"
                            onClick={() => ask(question)}
                            disabled={busy}
                            className="rounded-[7px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-[11px] py-[9px] text-left text-[13px] leading-[1.35] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {question}
                        </button>
                    ))}
                </div>
                <form
                    className="mt-auto flex gap-1.5 pt-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        ask(input);
                    }}
                >
                    <label htmlFor="jarvis-input" className="sr-only">
                        Ask Jarvis a question
                    </label>
                    <input
                        id="jarvis-input"
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={previousResponseId ? "Ask a follow-up…" : "Or type a question…"}
                        maxLength={2000}
                        disabled={busy}
                        className="field-input h-9 min-w-0 flex-1 text-[13px] disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || busy}
                        aria-label="Send question"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[var(--color-accent)] bg-transparent text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent-hover)] hover:bg-[var(--color-bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ArrowRight size={15} aria-hidden="true" />
                    </button>
                </form>
            </div>

            {/* Reasoning graph */}
            <div className="flex min-h-[260px] flex-col border-b border-[var(--color-border-subtle)] px-[26px] py-[22px] lg:min-h-[340px] lg:border-b-0 lg:border-r">
                <span className="pb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-meta)]">
                    Reasoning graph · {Math.min(doneCount, steps.length)}/{phase === "thinking" ? "…" : steps.length}
                </span>
                {phase === "idle" ? (
                    <span className="text-[13px] text-[var(--color-text-meta)]">Waiting for a question.</span>
                ) : (
                    <ol className="m-0 list-none p-0" aria-label="Reasoning steps">
                        {visibleSteps.map((step, index) => {
                            const state = stepState(index);
                            const lit = state === "done" || state === "active";
                            return (
                                <li key={`${step.label}-${index}`} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
                                    <div className="flex flex-col items-center">
                                        <StepMark state={state} />
                                        <span
                                            aria-hidden="true"
                                            className="min-h-3.5 w-px flex-1 transition-colors duration-300"
                                            style={{
                                                background:
                                                    state === "done" ? "var(--color-accent)" : "var(--color-border-subtle)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5 pb-3.5">
                                        <span
                                            className="truncate text-[13px]"
                                            style={{ color: lit ? "var(--color-text-primary)" : "var(--color-text-meta)" }}
                                        >
                                            {step.label}
                                        </span>
                                        <span className="truncate font-mono text-[11px] text-[var(--color-text-meta)]">
                                            {step.detail}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>

            {/* Answer */}
            <div className="flex min-w-0 flex-col gap-3.5 px-[26px] py-[22px]">
                <span className="flex items-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-meta)]">
                    Answer
                    {exchange && !busy ? (
                        <button
                            type="button"
                            onClick={reset}
                            className="ml-auto inline-flex items-center gap-1.5 rounded-[5px] px-1.5 py-0.5 normal-case tracking-normal text-[var(--color-text-meta)] transition-colors hover:text-[var(--color-text-primary)]"
                        >
                            <RotateCcw size={11} aria-hidden="true" />
                            new thread
                        </button>
                    ) : null}
                </span>
                {exchange ? (
                    <span className="text-sm text-[var(--color-text-subtle)]">{exchange.question}</span>
                ) : (
                    <span className="text-[13px] text-[var(--color-text-meta)]">
                        Answers cite the documents they draw on.
                    </span>
                )}
                {showAnswer && exchange ? (
                    <div
                        className={`prose-content chat-answer max-h-[360px] overflow-y-auto text-base leading-relaxed text-[var(--color-text-muted)] [text-wrap:pretty] ${phase === "answering" ? "is-typing" : ""}`}
                        aria-live="polite"
                    >
                        <ReactMarkdown components={ANSWER_COMPONENTS}>
                            {phase === "answering" ? typingMarkdown(exchange.answer.slice(0, shown)) : exchange.answer}
                        </ReactMarkdown>
                    </div>
                ) : null}
                {phase === "done" && exchange && !exchange.error ? (
                    <div className="mt-auto flex flex-wrap items-start gap-1.5">
                        {exchange.sources.map((source, index) => (
                            <SourceDetails key={source.id ?? index} source={source} index={index} />
                        ))}
                        {meta ? (
                            <span
                                className="ml-auto self-center font-mono text-[11px] text-[var(--color-text-meta)]"
                                title={exchange.model ?? undefined}
                            >
                                {meta}
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

Chatbot.propTypes = {
    className: PropTypes.string,
};

export default Chatbot;
