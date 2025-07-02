import React from "react"
import "../CSS/ScheduleCallButton.css"

const ScheduleCallButton = () => {
  return (
    <a
      href="https://scheduler.zoom.us/om-shewale/om-s-fireside-chats"
      className="schedule-call-btn"
      target="_blank"
      rel="noopener noreferrer"
      title="Schedule a Zoom Call With Me"
    >
      <span className="icon">
        {/* Calendar/Video Icon SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <rect x="7" y="11" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="11" y="11" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="15" y="11" width="2" height="2" rx="1" fill="currentColor"/>
        </svg>
      </span>
      <span className="label">Schedule a Call</span>
    </a>
  )
}

export default ScheduleCallButton 