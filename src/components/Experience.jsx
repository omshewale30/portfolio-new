// import React, { useEffect } from "react";
// import "../CSS/Experience.css";

// const experienceDetails = [
//     {
//         title: "Lead Software Developer",
//         company: "UNC Eshelman School of Pharmacy",
//         location: "Chapel Hill, NC",
//         duration: "10/2024 – 01/2025",
//         contributions: [
//             "Designed and developed a web-based 2D escape room game to enhance clinical education through interactive, puzzle-based learning.",
//             "Led a team to implement core functionality using Flutter, laying the foundation for an engaging user experience.",
//             "Developed an authoring tool to enable faculty to customize clinical content, supporting adaptable and scalable teaching methods across institutions.",
//         ],
//         technologies: ["Flutter", "Dart", "Web Development"],
//         image: "../assets/UNC_Pharmacy.jpg",
//     },
//     {
//         "title": "Deposit Specialist",
//         "company": "University of North Carolina - Chapel Hill",
//         "location": "Chapel Hill, NC, USA",
//         "duration": "09/2024 – Present",
//         "contributions": [
//             "Manage daily deposits and process university payments, ensuring compliance with financial regulations.",
//             "Track and reconcile transactions, handling approximately $5 million in deposits weekly.",
//             "Provide support to the banking team, assisting with customer inquiries and financial record maintenance.",
//             "Ensure adherence to the Daily Deposits Act and contribute to the university’s financial operations."
//         ],
//         "technologies": ["Excel", "Financial Reporting", "Data Reconciliation"],
//         "image": "../assets/UNC_FO.jpeg"
//     },

//     {
//         title: "Software Developer",
//         company: "NASA Psyche Mission",
//         location: "Tempe, AZ",
//         duration: "09/2023 – 04/2024",
//         contributions: [
//             "Collaborated as team lead on a web-based game promoting awareness of NASA's Psyche mission.",
//             "Designed realistic space environments and incorporated authentic NASA data, enhancing project immersion.",
//             "Delivered the project ahead of schedule, receiving positive feedback from NASA sponsors.",
//         ],
//         technologies: ["Unity", "Game Development", "C#"],
//         image: "assets/Pysche_logo.png",
//         report: "reports/nasa_project.pdf",
//     },
//     {
//         title: "Tutor",
//         company: "Arizona State University",
//         location: "Tempe, AZ",
//         duration: "08/2021 – 05/2024",
//         contributions: [
//                 "Provided comprehensive tutoring in Mathematics, Chemistry, Statistics, and programming languages such as Python and C++, emphasizing both theoretical understanding and practical application.",
//                 "Simplified complex topics into manageable concepts, creating a tailored approach to meet individual learning needs and enhance academic performance."
//         ],
//         technologies: ["Mathematics", "Chemistry", "Python", "C++"],

//         image: "../assets/ASN.png",
//     },
//     {
//         title: "Teaching Assistant",
//         company: "Arizona State University",
//         location: "Tempe, AZ",
//         duration: "08/2022 – 05/2024",
//         contributions: [
//             "Mentored 100+ freshmen engineering students in Calculus, boosting academic performance with customized guidance programs.",
//             "Delivered calculus concepts effectively, leveraging clear communication and hands-on problem-solving exercises.",
//         ],
//         technologies: ["Mentoring, Teaching, Calculus", "Engineering"],
//         image: "../assets/ASU.png",
//     },

// ];

// const Experience = () => {
//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     if (entry.isIntersecting) {
//                         entry.target.classList.add("in-view");
//                     }
//                 });
//             },
//             { threshold: 0.2 }
//         );

//         const cards = document.querySelectorAll(".experience-card");
//         cards.forEach((card) => observer.observe(card));

//         return () => observer.disconnect();
//     }, []);

//     return (
//         <section id="experience" className="experience-section">
//             <h2 className="experience-title">Experience</h2>
//             <div className="container">
//                 <div className="row">
//                     {experienceDetails.map((exp, index) => (
//                         <div
//                             key={index}
//                             className="col-md-6 mb-4 d-flex align-items-stretch"
//                         >
//                             <div className="card experience-card">
//                                 <div className="row g-0">
//                                     <div className="col-md-4">
//                                         <img
//                                             src={exp.image}
//                                             alt={`${exp.company} logo`}
//                                             className="img-fluid rounded-start"
//                                         />
//                                     </div>
//                                     <div className="col-md-8">
//                                         <div className="card-body">
//                                             <h3 className="experience-role">{exp.title}</h3>
//                                             <h4 className="experience-company">{exp.company}</h4>
//                                             <p className="experience-duration">
//                                                 {exp.duration} <br />
//                                                 <span className="experience-location">
//                                                     {exp.location}
//                                                 </span>
//                                             </p>
//                                             <ul className="experience-contributions">
//                                                 {exp.contributions.map((contribution, i) => (
//                                                     <li key={i}>{contribution}</li>
//                                                 ))}
//                                             </ul>
//                                             <p className="experience-technologies">
//                                                 <strong>Skills:</strong> {exp.technologies.join(", ")}
//                                             </p>
//                                             {exp.report && (
//                                                 <a
//                                                     href={exp.report}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="btn btn-primary experience-report-link"
//                                                 >
//                                                     View Report
//                                                 </a>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Experience;
"use client"
import "../CSS/Experience.css"
import { useEffect } from "react"

const experienceDetails = [

  {
    title: "Deposit Specialist",
    company: "University of North Carolina - Chapel Hill",
    location: "Chapel Hill, NC, USA",
    duration: "09/2024 – Present",
    contributions: [
      "Manage daily deposits and process university payments, ensuring compliance with financial regulations.",
      "Track and reconcile transactions, handling approximately $3 million in deposits weekly.",
      "Provide support to the banking team, assisting with customer inquiries and financial record maintenance.",
      "Ensure adherence to the Daily Deposits Act and contribute to the university's financial operations.",
    ],
    technologies: ["Excel", "Financial Reporting", "Data Reconciliation"],
    image: "../assets/UNC_FO.jpeg",
    type: "finance",
  },
  {
    title: "Lead Software Developer",
    company: "UNC Eshelman School of Pharmacy",
    location: "Chapel Hill, NC",
    duration: "10/2024 – 01/2025",
    contributions: [
      "Designed and developed a web-based 2D escape room game to enhance clinical education through interactive, puzzle-based learning.",
      "Led a team to implement core functionality using Flutter, laying the foundation for an engaging user experience.",
      "Developed an authoring tool to enable faculty to customize clinical content, supporting adaptable and scalable teaching methods across institutions.",
    ],
    technologies: ["Flutter", "Dart", "Web Development"],
    image: "../assets/UNC_Pharmacy.jpg",
    type: "development",
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
    image: "assets/Pysche_logo.png",
    report: "reports/nasa_project.pdf",
    type: "development",
  },
  {
    title: "Tutor",
    company: "Arizona State University",
    location: "Tempe, AZ",
    duration: "08/2021 – 05/2024",
    contributions: [
      "Provided comprehensive tutoring in Mathematics, Chemistry, Statistics, and programming languages such as Python and C++, emphasizing both theoretical understanding and practical application.",
      "Simplified complex topics into manageable concepts, creating a tailored approach to meet individual learning needs and enhance academic performance.",
    ],
    technologies: ["Mathematics", "Chemistry", "Python", "C++"],
    image: "../assets/ASN.png",
    type: "education",
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
    technologies: ["Mentoring", "Teaching", "Calculus", "Engineering"],
    image: "../assets/ASU.png",
    type: "education",
  },
]

const Experience = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
          }
        })
      },
      { threshold: 0.2 },
    )

    const cards = document.querySelectorAll(".experience-card")
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const getTypeIcon = (type) => {
    switch (type) {
      case "development":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 18L22 12L16 6M8 6L2 12L8 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "finance":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "education":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22 10V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V10C2 10.5304 2.21071 11.0391 2.58579 11.4142C2.96086 11.7893 3.46957 12 4 12H20C20.5304 12 21.0391 11.7893 21.4142 11.4142C21.7893 11.0391 22 10.5304 22 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12V16C6 16.5304 6.21071 17.0391 6.58579 17.4142C6.96086 17.7893 7.46957 18 8 18H16C16.5304 18 17.0391 17.7893 17.4142 17.4142C17.7893 17.0391 18 16.5304 18 16V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <section id="experience" className="experience-section">
      <div className="experience-container">
        <div className="experience-header">
          <h2 className="experience-title">Professional Experience</h2>
          <p className="experience-subtitle">A journey through diverse roles in technology, education, and finance</p>
        </div>

        <div className="timeline">
          {experienceDetails.map((exp, index) => (
            <div key={index} className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}>
              <div className="timeline-marker">
                <div className="timeline-icon">{getTypeIcon(exp.type)}</div>
              </div>

              <div className="experience-card">
                <div className="card-header">
                  <div className="company-logo">
                    <img src={exp.image || "/placeholder.svg"} alt={`${exp.company} logo`} />
                  </div>
                  <div className="position-info">
                    <h3 className="experience-role">{exp.title}</h3>
                    <h4 className="experience-company">{exp.company}</h4>
                    <div className="experience-meta">
                      <span className="experience-duration">{exp.duration}</span>
                      <span className="experience-location">{exp.location}</span>
                    </div>
                  </div>
                </div>

                <div className="card-content">
                  <ul className="experience-contributions">
                    {exp.contributions.map((contribution, i) => (
                      <li key={i}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {contribution}
                      </li>
                    ))}
                  </ul>

                  <div className="card-footer">
                    <div className="experience-technologies">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {exp.report && (
                      <a href={exp.report} target="_blank" rel="noopener noreferrer" className="report-link">
                        <span>View Report</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience
