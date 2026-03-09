import React, { useEffect, useState } from "react";
import { Grid, Code, Cpu, Github, Instagram, Linkedin } from "lucide-react";
import ScheduleCallButton from "./ScheduleCallButton";

const PHRASES = [
    "solving business problems with AI💼",
    "designing intelligent systems with neural networks🧠",
    "building AI agents🤖",
    "critical problem solving🤔",
];

const LandingPage = () => {
    const gridSize = 50;
    const dots = Array(gridSize).fill(null);

    const scrollToNextSection = () => {
        const nextSection = document.querySelector(".hero");
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: "smooth" });
        }
    };


    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopIndex, setLoopIndex] = useState(0);
    const [typingSpeed] = useState(100);

    useEffect(() => {
        const handleTyping = () => {
            const currentPhrase = PHRASES[loopIndex % PHRASES.length];
            if (!isDeleting) {
                setText(currentPhrase.substring(0, text.length + 1));
                if (text === currentPhrase) {
                    setTimeout(() => setIsDeleting(true), 1000);
                }
            } else {
                setText(currentPhrase.substring(0, text.length - 1));
                if (text === "") {
                    setIsDeleting(false);
                    setLoopIndex(loopIndex + 1);
                }
            }
        };
        const timer = setTimeout(handleTyping, isDeleting ? 50 : typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopIndex, typingSpeed]);


    return (
        <div className="relative h-screen w-full overflow-hidden bg-[var(--color-bg-base)]">
            <div className="pointer-events-none absolute -left-[20%] -top-[30%] h-[60%] w-[60%] animate-[float-orb_15s_ease-in-out_infinite] bg-[radial-gradient(circle,rgba(200,168,130,0.14)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute -bottom-[30%] -right-[20%] h-[70%] w-[70%] animate-[float-orb_18s_ease-in-out_infinite_reverse] bg-[radial-gradient(circle,rgba(184,140,94,0.12)_0%,transparent_70%)]" />
            <ScheduleCallButton />

            <div className="fixed right-8 top-20 z-[1100] flex gap-3 rounded-full border border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.7)] px-4 py-3 backdrop-blur-xl max-md:bottom-8 max-md:right-1/2 max-md:top-auto max-md:translate-x-1/2">
                <a
                    href="https://github.com/omshewale30"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] max-md:h-9 max-md:w-9"
                >
                    <Github size={20} />
                </a>
                <a
                    href="https://instagram.com/omshewale3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] max-md:h-9 max-md:w-9"
                >
                    <Instagram size={20} />
                </a>
                <a
                    href="https://www.linkedin.com/in/omshewale/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] max-md:h-9 max-md:w-9"
                >
                    <Linkedin size={20} />
                </a>
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-35">
                <div className="grid h-full grid-cols-10 gap-12 p-12 max-[480px]:grid-cols-5 max-[480px]:gap-8">
                    {dots.map((_, i) => (
                        <div key={i} className="relative aspect-square">
                            <div
                                className="absolute h-[3px] w-[3px] animate-[dot-pulse_4s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)] opacity-0"
                                style={{ animationDelay: `${(i % 10) * 400 + Math.floor(i / 10) * 200}ms` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute left-[10%] top-[20%] flex h-20 w-20 animate-[float-1_8s_ease-in-out_infinite] items-center justify-center rounded-[20px] border border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.6)] text-[var(--color-primary-muted)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] max-md:left-[5%] max-md:h-[60px] max-md:w-[60px] max-md:rounded-2xl max-[480px]:hidden">
                <Grid size={32} strokeWidth={1.5} className="max-md:h-7 max-md:w-7" />
            </div>
            <div className="absolute bottom-[25%] right-[15%] flex h-20 w-20 animate-[float-2_10s_ease-in-out_infinite] items-center justify-center rounded-[20px] border border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.6)] text-[var(--color-primary-muted)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] max-md:h-[60px] max-md:w-[60px] max-md:rounded-2xl max-[480px]:hidden">
                <Code size={32} strokeWidth={1.5} className="max-md:h-7 max-md:w-7" />
            </div>
            <div className="absolute right-[20%] top-[15%] flex h-20 w-20 animate-[float-3_12s_ease-in-out_infinite] items-center justify-center rounded-[20px] border border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.6)] text-[var(--color-primary-muted)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] max-md:right-[5%] max-md:h-[60px] max-md:w-[60px] max-md:rounded-2xl max-[480px]:hidden">
                <Cpu size={32} strokeWidth={1.5} className="max-md:h-7 max-md:w-7" />
            </div>

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                <h1 className="landing-reveal font-display text-5xl italic tracking-[-0.02em] text-[var(--color-text-primary)] md:text-7xl">
                    Om Shewale
                </h1>
                <div className="landing-expand-divider my-6 h-px rounded-sm bg-gradient-to-r from-transparent via-[var(--color-primary)] via-50% to-transparent" />
                <h2 className="landing-reveal landing-reveal-delay-400 font-display mb-6 text-2xl italic text-[var(--color-primary)] md:text-3xl">
                    AI Engineer
                </h2>
                <h3 className="landing-reveal landing-reveal-delay-600 max-w-[640px] px-4 text-base leading-[1.8] text-[var(--color-text-muted)] md:text-xl">
                    I like{" "}
                    <span className="inline-flex items-center font-medium text-[var(--color-primary)]">
                        {text}
                        <span className="ml-1 inline-block h-[1.2em] w-[2px] animate-[cursorblink_1s_step-end_infinite] bg-[var(--color-primary)]" />
                    </span>
                    .
                </h3>

                <button
                    type="button"
                    className="landing-reveal landing-reveal-delay-1000 absolute bottom-12 left-1/2 z-20 flex w-fit -translate-x-1/2 flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1 max-[480px]:bottom-40"
                    onClick={scrollToNextSection}
                >
                    <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-meta)] transition-colors duration-300 hover:text-[var(--color-primary)]">
                        Scroll Down
                    </span>
                    <span className="relative h-6 w-6">
                        <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2  animate-[arrowbounce_2s_ease-in-out_infinite] border-b-2 border-r-2 border-[var(--color-primary-muted)]" />
                        <span className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2  animate-[arrowbounce_2s_ease-in-out_infinite_0.2s] border-b-2 border-r-2 border-[var(--color-primary-muted)]" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;