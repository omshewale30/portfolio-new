
import React, { useEffect, useRef } from 'react';
import '../CSS/SkillsSection.css';

const skills = {
    Languages: [
        { name: "Python", proficiency: 9 },
        { name: "C++", proficiency: 8 },
        { name: "JavaScript", proficiency: 8 },
        { name: "Java", proficiency: 8 },
        { name: "HTML", proficiency: 8 },
        { name: "Swift", proficiency: 8 },
        { name: "SQL", proficiency: 7 },
        { name: "CSS", proficiency: 7 },
    ],
    Frameworks: [
        { name: "React", proficiency: 9 },
        { name: "FastAPI", proficiency: 9 },
        { name: "LangChain", proficiency: 8 },
        { name: "Tailwind CSS", proficiency: 8 },
        { name: "TensorFlow", proficiency: 8 },
        { name: "Scikit-learn", proficiency: 8 },
        { name: "Node.js", proficiency: 8 },
        { name: "Express", proficiency: 7 },
 
    ],
    Tools: [
        { name: "Supabase", proficiency: 9 },
        { name: "Git", proficiency: 9 },
        { name: "GitHub", proficiency: 8 },
        { name: "Docker", proficiency: 7 },
        { name: "Jira", proficiency: 8 },
        { name: "JUnit", proficiency: 8 },
        { name: "MySQL", proficiency: 8 },
        { name: "MongoDB", proficiency: 6 },
    ]
};

const categoryIcons = {
    Languages: "💻",
    Frameworks: "⚡",
    Tools: "🛠️"
};

const categoryColors = {
    Languages: { primary: "#6366f1", secondary: "#8b5cf6", bg: "rgba(99, 102, 241, 0.05)" },
    Frameworks: { primary: "#06b6d4", secondary: "#0891b2", bg: "rgba(6, 182, 212, 0.05)" },
    Tools: { primary: "#10b981", secondary: "#059669", bg: "rgba(16, 185, 129, 0.05)" }
};

const CircularProgress = ({ proficiency, category }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (proficiency / 10) * circumference;
    const circleRef = useRef(null);
    const colors = categoryColors[category];

    useEffect(() => {
        if (circleRef.current) {
            circleRef.current.style.strokeDashoffset = circumference;
            setTimeout(() => {
                circleRef.current.style.strokeDashoffset = strokeDashoffset;
            }, 300);
        }
    }, [circumference, strokeDashoffset]);

    return (
        <div className="progress-container">
            <svg className="progress-ring" width="50" height="50">
                <defs>
                    <linearGradient id={`gradient-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.primary} />
                        <stop offset="100%" stopColor={colors.secondary} />
                    </linearGradient>
                </defs>
                <circle
                    className="progress-ring-circle-bg"
                    cx="25"
                    cy="25"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(0, 0, 0, 0.08)"
                />
                <circle
                    ref={circleRef}
                    className="progress-ring-circle"
                    cx="25"
                    cy="25"
                    r={radius}
                    fill="transparent"
                    stroke={`url(#gradient-${category})`}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </svg>
            <div className="proficiency-text">
                <span className="proficiency-number">{proficiency}</span>
                <span className="proficiency-total">/10</span>
            </div>
        </div>
    );
};

const SkillsSection = () => {
    return (
        <section className="skills-section">
            <div className="skills-header">
                <h2 className="skills-title">Technical Skills</h2>
                <p className="skills-subtitle">Expertise across languages, frameworks, and development tools</p>
            </div>
            
            <div className="skills-grid">
                {Object.entries(skills).map(([category, items]) => (
                    <div key={category} className="skills-card" data-category={category.toLowerCase()}>
                        <div className="card-header">
                            <div className="category-icon">{categoryIcons[category]}</div>
                            <h3 className="category-title">{category}</h3>
                            <div className="skill-count">{items.length} skills</div>
                        </div>
                        
                        <div className="skills-list">
                            {items.map((skill, index) => (
                                <div 
                                    key={skill.name} 
                                    className="skill-item"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="skill-info">
                                        <span className="skill-name">{skill.name}</span>
                                        <div className="skill-level">
                                            <span className="level-text">
                                                {skill.proficiency >= 9 ? 'Expert' : 
                                                 skill.proficiency >= 7 ? 'Advanced' : 
                                                 skill.proficiency >= 5 ? 'Intermediate' : 'Beginner'}
                                            </span>
                                        </div>
                                    </div>
                                    <CircularProgress proficiency={skill.proficiency} category={category} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SkillsSection;
