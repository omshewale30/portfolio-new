import React from 'react';
import "../CSS/SkillsSection.css";

const skills = {
    Languages: [
        { name: "Python", proficiency: 9 },
        { name: "C++", proficiency: 8 },
        { name: "JavaScript", proficiency: 8 },
        { name: "Java", proficiency: 8 },
        {name: "HTML", proficiency: 8 },
        { name: "Swift", proficiency: 8 },
        { name: "SQL", proficiency: 7 },
        { name: "CSS", proficiency: 7 },

    ],
    Frameworks: [
        { name: "React", proficiency: 8 },
        { name: "TensorFlow", proficiency: 8 },
        { name: "Scikit-learn", proficiency: 8 },
        { name: "Node.js", proficiency: 8 },
        { name: "Express", proficiency: 7 },
        { name: "MongoDB", proficiency: 6 },
    ],
    Tools: [
        { name: "Git", proficiency: 9 },
        { name: "GitHub", proficiency: 8 },
        { name: "Docker", proficiency: 7 },
        { name: "Jira", proficiency: 8 },
        { name: "JUnit", proficiency: 8 },
        { name: "Selenium", proficiency: 8 },
        { name: "MySQL", proficiency: 8 },
    ]
};

const CircularProgress = ({ proficiency }) => {
    const radius = 30; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle
    const strokeDashoffset = circumference - (proficiency / 10) * circumference; // Progress offset

    return (
        <svg className="progress-ring" width="80" height="80">
            <circle
                className="progress-ring-circle-bg"
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="#ddd"
                strokeWidth="6"
            />
            <circle
                className="progress-ring-circle"
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="#007bff"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
            />
        </svg>
    );
};

const SkillsSection = () => {
    return (
        <div className="skills-section">
            {Object.entries(skills).map(([category, items]) => (
                <div key={category} className="skills-card">
                    <h3>{category}</h3>
                    <ul>
                        {items.map((skill) => (
                            <li key={skill.name} className="skill-item">
                                <span>{skill.name}</span>
                                <CircularProgress proficiency={skill.proficiency} />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default SkillsSection;
