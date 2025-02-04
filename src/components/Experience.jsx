import React, { useEffect } from "react";
import "../CSS/Experience.css";

const experienceDetails = [
    {
        title: "Lead Software Developer",
        company: "UNC Eshelman School of Pharmacy",
        location: "Chapel Hill, NC",
        duration: "10/2024 – Present",
        contributions: [
            "Designed and developed a web-based 2D escape room game to enhance clinical education through interactive, puzzle-based learning.",
            "Led a team to implement core functionality using Flutter, laying the foundation for an engaging user experience.",
            "Developed an authoring tool to enable faculty to customize clinical content, supporting adaptable and scalable teaching methods across institutions.",
        ],
        technologies: ["Flutter", "Dart", "Web Development"],
        image: "src/assets/UNC_Pharmacy.jpg",
    },
    {
        title: "Software Developer",
        company: "NASA Psyche Mission",
        location: "Tempe, AZ",
        duration: "09/2023 – 04/2024",
        contributions: [
            "Collaborated as team lead on a web-based game promoting awareness of NASA's Psyche mission.",
            "Designed realistic space environments and incorporated authentic NASA data, enhancing project immersion.",
            "Delivered the project ahead of schedule, receiving positive feedback from NASA sponsors.",
        ],
        technologies: ["Unity", "Game Development", "C#"],
        image: "src/assets/Pysche_logo.png",
        report: "reports/nasa_project.pdf",
    },
    {
        title: "Tutor",
        company: "Arizona State University",
        location: "Tempe, AZ",
        duration: "08/2021 – 05/2024",
        contributions: [
                "Provided comprehensive tutoring in Mathematics, Chemistry, Statistics, and programming languages such as Python and C++, emphasizing both theoretical understanding and practical application.",
                "Simplified complex topics into manageable concepts, creating a tailored approach to meet individual learning needs and enhance academic performance."
        ],
        technologies: ["Mathematics", "Chemistry", "Python", "C++"],

        image: "src/assets/ASN.png",
    },
    {
        title: "Teaching Assistant",
        company: "Arizona State University",
        location: "Tempe, AZ",
        duration: "08/2022 – 05/2024",
        contributions: [
            "Mentored 100+ freshmen engineering students in Calculus, boosting academic performance with customized guidance programs.",
            "Delivered calculus concepts effectively, leveraging clear communication and hands-on problem-solving exercises.",
        ],
        technologies: ["Mentoring, Teaching, Calculus", "Engineering"],
        image: "src/assets/ASU.png",
    },

];

const Experience = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                    }
                });
            },
            { threshold: 0.2 }
        );

        const cards = document.querySelectorAll(".experience-card");
        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="experience" className="experience-section">
            <h2 className="experience-title">Experience</h2>
            <div className="container">
                <div className="row">
                    {experienceDetails.map((exp, index) => (
                        <div
                            key={index}
                            className="col-md-6 mb-4 d-flex align-items-stretch"
                        >
                            <div className="card experience-card">
                                <div className="row g-0">
                                    <div className="col-md-4">
                                        <img
                                            src={exp.image}
                                            alt={`${exp.company} logo`}
                                            className="img-fluid rounded-start"
                                        />
                                    </div>
                                    <div className="col-md-8">
                                        <div className="card-body">
                                            <h3 className="experience-role">{exp.title}</h3>
                                            <h4 className="experience-company">{exp.company}</h4>
                                            <p className="experience-duration">
                                                {exp.duration} <br />
                                                <span className="experience-location">
                                                    {exp.location}
                                                </span>
                                            </p>
                                            <ul className="experience-contributions">
                                                {exp.contributions.map((contribution, i) => (
                                                    <li key={i}>{contribution}</li>
                                                ))}
                                            </ul>
                                            <p className="experience-technologies">
                                                <strong>Skills:</strong> {exp.technologies.join(", ")}
                                            </p>
                                            {exp.report && (
                                                <a
                                                    href={exp.report}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary experience-report-link"
                                                >
                                                    View Report
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
