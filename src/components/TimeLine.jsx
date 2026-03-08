import React from "react";
import { GraduationCap, Rocket, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Timeline = () => {
    const navigate = useNavigate();
    const story = [
        {
            year: "2020",
            title: "The First Step",
            description: `I began my Bachelor's in Computer Science at Arizona State University, I had no idea what lay ahead.`,
            icon: <GraduationCap />,
        },
        {
            year: "2022",
            title: "A Year of Hardships",
            description: `I fell prey to imposter syndrome, but I persevered, learning to embrace challenges and grow from them.`,
            icon: <AlertTriangle />,
        },
        {
            year: "2023",
            title: "Real world projects",
            description: `As a tutor and teaching assistant, I honed my skills by helping others in programming concept and working on real-world projects like macro tracking iOS app.`,
            icon: "📊",
        },
        {
            year: "2023",
            title: "Introduction of ChatGPT and AI revolution",
            description: `I enrolled in my first core AI class and built foundational knowledge of AI agents and nerual networks.`,
            icon: "📜",
        },
        {
            year: "2024",
            title: "NASA Psyche Mission",
            description:
                "Worked with NASA on the Psyche Mission game project, a journey to a unique metal asteroid orbiting the Sun between Mars and Jupiter.",
            icon: <Rocket />,
        },
        {
            year: "2024",
            title: "A Year of Milestones",
            description: `2024 was a transformative year with key achievements and exciting transitions.`,
            icon: "🌟",
            subsections: [
                {
                    title: "Graduated from ASU",
                    description: `Graduated Summa cum laude from Arizona State University with a Computer Science degree.`,
                    icon: <GraduationCap />,
                },
                {
                    title: "Started Grad School at UNC",
                    description: `Enrolled in UNC to deepen my understanding of AI, opening a new chapter in my academic journey.`,
                    icon: <Rocket />,
                },
                {
                    title: "Joined the UNC Finance Operations Team",
                    description: `Took on the role of Deposit Specialist, processing around $3 million in deposits and payments weekly.`,
                    icon: "💼",
                },

                {

                    title: "Joined UNC Eshelman School of Pharmacy",
                    description: `Became a Lead Software Developer, working on an innovative project to enhance healthcare education and research.`,
                    icon: "💊",
                },
            ],
        },
    ];

    return (
        <section
            id="timeline"
            className="relative overflow-hidden bg-[var(--color-bg-base)]"
        >
            <div className="section-shell relative">
                <p className="eyebrow-label mb-3">// Timeline</p>
                <h2 className="font-display mb-8 text-4xl text-[var(--color-text-primary)] max-md:text-[2.3rem] max-[480px]:text-[2rem]">
                    My Journey
                </h2>
                <div className="relative mx-auto flex max-w-[1040px] flex-col items-center justify-center gap-6">
                {story.map((milestone, index) => (
                    <div
                        key={index}
                        className="surface-card group relative w-full max-w-[860px] p-7 text-left max-lg:px-6 max-lg:py-7 max-md:px-5 max-md:py-6 max-[480px]:px-4 max-[480px]:py-5"
                    >
                        <div className="absolute left-0 top-0 h-full w-px bg-[var(--color-border-muted)]" />
                        <div className="absolute -left-2 top-8 h-4 w-4 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-primary)]" />
                        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-primary)] max-md:h-9 max-md:w-9">
                            {milestone.icon}
                        </div>
                        <div className="pl-4 pr-12">
                            <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">{milestone.year}</h3>
                            <h4 className="font-display mb-3 text-2xl text-[var(--color-text-primary)] max-md:text-xl max-[480px]:text-[1.1rem]">{milestone.title}</h4>
                            <p className="text-[1.05rem] leading-relaxed text-[var(--color-text-muted)] max-md:text-base max-[480px]:text-[0.95rem]">{milestone.description}</p>

                            {milestone.subsections && (
                                <div className="mt-6 border-l border-[var(--color-border-subtle)] pl-6 max-md:pl-4">
                                    {milestone.subsections.map((subsection, subIndex) => (
                                        <div
                                            key={subIndex}
                                            className="mb-4 flex items-start gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4 transition-all duration-300 hover:translate-x-1 max-md:p-3 max-[480px]:p-2.5"
                                        >
                                            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] p-2 text-[1.1rem] text-[var(--color-primary)]">
                                                {subsection.icon}
                                            </div>
                                            <div>
                                                <h4 className="mb-1 text-[1.05rem] font-semibold text-[var(--color-text-primary)] max-md:text-base max-[480px]:text-[0.95rem]">
                                                    {subsection.title}
                                                </h4>
                                                <p className="text-base leading-normal text-[var(--color-text-muted)] max-md:text-[0.95rem] max-[480px]:text-[0.9rem]">
                                                    {subsection.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="section-shell pt-0">
                <button
                    className="btn-primary inline-flex items-center gap-3"
                    onClick={() => {
                        navigate("/experience");
                        setTimeout(() => {
                            const experienceSection = document.getElementById("experience");
                            if (experienceSection) {
                                const navbarHeight = document.querySelector(".navbar").offsetHeight;
                                const scrollPosition = experienceSection.offsetTop - navbarHeight;
                                window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                            }
                        }, 100);
                    }}
                >
                    View Full Experience
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default Timeline;
