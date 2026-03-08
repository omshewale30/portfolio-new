import React from 'react';

const skills = {
    Languages: [
        { name: "Python" },
        { name: "C++" },
        { name: "JavaScript" },
        { name: "Java" },
        { name: "HTML" },
        { name: "Swift" },
        { name: "SQL" },
        { name: "CSS" },
    ],
    Frameworks: [
        { name: "React" },
        { name: "FastAPI" },
        { name: "LangChain" },
        { name: "Tailwind CSS" },
        { name: "TensorFlow" },
        { name: "Scikit-learn" },
        { name: "Node.js" },
        { name: "Express" },
    ],
    Tools: [
        { name: "Supabase" },
        { name: "Git" },
        { name: "GitHub" },
        { name: "Docker" },
        { name: "Jira" },
        { name: "JUnit" },
        { name: "MySQL" },
        { name: "MongoDB" },
    ]
};

const categoryIcons = {
    Languages: "💻",
    Frameworks: "⚡",
    Tools: "🛠️"
};

const SkillsSection = () => {
    return (
        <section
            id="skills"
            className="relative overflow-hidden bg-[var(--color-bg-base)]"
        >
            <div className="section-shell">
            <div className="relative mb-12 animate-[fade-in-up_0.8s_ease-out]">
                <p className="eyebrow-label mb-3">// Skills</p>
                <h2 className="font-display mb-4 text-4xl tracking-[-0.02em] text-[var(--color-text-primary)] max-md:text-[2.5rem] max-[480px]:text-[2rem]">
                    Technical Skills
                </h2>
                <p className="max-w-[600px] text-xl leading-relaxed text-[var(--color-text-muted)] max-md:text-[1.1rem]">
                    Expertise across languages, frameworks, and development tools
                </p>
            </div>
            
            <div className="relative mx-auto grid w-full max-w-[1400px] animate-[fade-in-up_0.8s_ease-out_0.2s_both] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[30px] max-lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] max-lg:gap-6 max-md:grid-cols-1 max-md:gap-5">
                {Object.entries(skills).map(([category, items]) => (
                    <div
                        key={category}
                        className="surface-card group relative overflow-hidden p-10 transition-all duration-300 hover:-translate-y-1 max-md:px-6 max-md:py-8 max-[480px]:px-5 max-[480px]:py-6"
                        data-category={category.toLowerCase()}
                    >
                        <div
                            className={`absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                                category === "Languages"
                                    ? "bg-gradient-to-r from-[var(--color-primary)] to-[#b58e60]"
                                    : category === "Frameworks"
                                        ? "bg-gradient-to-r from-[#ad875d] to-[#9a754f]"
                                        : "bg-gradient-to-r from-[#c8a882] to-[#8f6e4a]"
                            }`}
                        />
                        <div className="mb-6 flex items-center gap-4 border-b border-[var(--color-border-muted)] pb-4">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] text-2xl text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                                    category === "Languages"
                                        ? "bg-[rgba(200,168,130,0.18)]"
                                        : category === "Frameworks"
                                            ? "bg-[rgba(181,141,94,0.2)]"
                                            : "bg-[rgba(154,117,79,0.2)]"
                                }`}
                            >
                                {categoryIcons[category]}
                            </div>
                            <h3 className="font-display text-2xl text-[var(--color-text-primary)] max-[480px]:text-xl">{category}</h3>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {items.map((skill, index) => (
                                <div 
                                    key={skill.name} 
                                    className="animate-[slide-in-left_0.6s_ease-out_both] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3 transition-all duration-300 hover:translate-x-1 hover:border-[var(--color-primary-muted)] max-[480px]:px-3.5 max-[480px]:py-2.5"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <span className="text-base font-medium text-[var(--color-text-muted)]">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </section>
    );
};

export default SkillsSection;
