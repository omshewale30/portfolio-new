import React from "react";

const ScheduleCallButton = ({ inline = false }) => {
  const calendarIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="7" y="11" width="2" height="2" rx="1" fill="currentColor"/>
      <rect x="11" y="11" width="2" height="2" rx="1" fill="currentColor"/>
      <rect x="15" y="11" width="2" height="2" rx="1" fill="currentColor"/>
    </svg>
  );

  if (inline) {
    return (
      <a
        href="https://scheduler.zoom.us/om-shewale/om-s-fireside-chats"
        className="schedule-call-btn schedule-call-btn--small inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] font-medium text-[var(--color-bg-base)] no-underline shadow-[var(--shadow-button)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-button-hover)] max-[480px]:px-2.5 max-[480px]:py-1 max-[480px]:text-[0.7rem]"
        target="_blank"
        rel="noopener noreferrer"
        title="Schedule a Zoom Call With Me"
      >
        <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{calendarIcon}</span>
        <span className="font-mono uppercase tracking-[0.08em]">Schedule a Call</span>
      </a>
    );
  }

  return (
    <a
      href="https://scheduler.zoom.us/om-shewale/om-s-fireside-chats"
      className="schedule-call-btn absolute left-8 top-[5.5rem] z-[1000] flex items-center gap-2 rounded-full text-[0.8rem] font-medium text-[var(--color-bg-base)] no-underline shadow-[var(--shadow-button)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-button-hover)] md:left-4 md:top-[4.5rem] md:text-[0.75rem] max-[480px]:left-4 max-[480px]:top-[4.5rem] max-[480px]:text-[0.7rem]"
      target="_blank"
      rel="noopener noreferrer"
      title="Schedule a Zoom Call With Me"
    >
      <span className="flex items-center text-[var(--color-bg-base)] [&_svg]:h-4 [&_svg]:w-4 md:[&_svg]:h-3.5 md:[&_svg]:w-3.5 max-[480px]:[&_svg]:h-3 max-[480px]:[&_svg]:w-3">
        {calendarIcon}
      </span>
      <span className="font-mono uppercase tracking-[0.08em] text-[var(--color-bg-base)]">Schedule a Call</span>
    </a>
  );
};

export default ScheduleCallButton;
