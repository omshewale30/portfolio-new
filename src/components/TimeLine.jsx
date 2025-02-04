import React, { useEffect } from "react";
import "/src/CSS/TimeLine.css"
import AOS from "aos";
import "aos/dist/aos.css";

const Timeline = () => {
    const story = [
        {
            year: "2020",
            title: "The First Step",
            description: `I began my Bachelor's in Computer Science at Arizona State University, I had no idea what lay ahead.`,
            icon: "🎓",
        },
        {
            year: "2022",
            title: "A Year of Hardships",
            description: `I fell prey to imposter syndrome, but I persevered, learning to embrace challenges and grow from them.`,
            icon: "⚠️",
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
        {   year : "2024",
            title: "NASA Psyche Mission",
            description: 'Worked with NASA on the Psyche Mission game project, a journey to a unique metal asteroid orbiting the Sun between Mars and Jupiter.',
            icon: "🚀",
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
                    icon: "🎓",
                },
                {
                    title: "Started Grad School at UNC",
                    description: `Enrolled in UNC to deepen my understanding of AI , opening a new chapter in my academic journey.`,
                    icon: "🚀",
                },
            ],
        },
    ];

    useEffect(() => {
        AOS.init({ duration: 1000, once: true }); // Initialize AOS with the 'once' option for single animation
    }, []);

    return (
        <div id="timeline" className="timeline-container">
            <h2 className="timeline-title">My Journey</h2>
            <div className="story-timeline">
                {story.map((milestone, index) => (
                    <div
                        key={index}
                        className="story-event"
                        data-aos="fade-up"
                        data-aos-delay={`${index * 200}`} // Apply staggered delays
                    >
                        <div className="story-icon">{milestone.icon}</div>
                        <div className="story-content">
                            <h3 className="story-year">{milestone.year}</h3>
                            <h4 className="story-title">{milestone.title}</h4>
                            <p className="story-description">{milestone.description}</p>

                            {milestone.subsections && (
                                <div className="story-subsections">
                                    {milestone.subsections.map((subsection, subIndex) => (
                                        <div
                                            key={subIndex}
                                            className="story-subsection"
                                            data-aos="fade-left"
                                            data-aos-delay={`${subIndex * 200}`}
                                        >
                                            <div className="subsection-icon">{subsection.icon}</div>
                                            <div className="subsection-content">
                                                <h4 className="subsection-title">{subsection.title}</h4>
                                                <p className="subsection-description">
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
    );
};

export default Timeline;
