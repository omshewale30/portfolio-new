import React from 'react';
import '../CSS/SkillsSection.css';

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

const categoryColors = {
    Languages: { primary: "#6366f1", secondary: "#8b5cf6", bg: "rgba(99, 102, 241, 0.05)" },
    Frameworks: { primary: "#06b6d4", secondary: "#0891b2", bg: "rgba(6, 182, 212, 0.05)" },
    Tools: { primary: "#10b981", secondary: "#059669", bg: "rgba(16, 185, 129, 0.05)" }
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
                        </div>
                        
                        <div className="skills-list">
                            {items.map((skill, index) => (
                                <div 
                                    key={skill.name} 
                                    className="skill-item"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <span className="skill-name">{skill.name}</span>
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
