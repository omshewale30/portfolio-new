import React from "react";

const ScheduleCallButton = () => {
  return (
    <a
      href="https://scheduler.zoom.us/om-shewale/om-s-fireside-chats"
      className="schedule-call-btn absolute left-8 top-[5.5rem] z-[1000] items-center gap-3 rounded-full text-[0.95rem] font-medium text-[var(--color-bg-base)] no-underline shadow-[var(--shadow-button)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[var(--shadow-button-hover)] md:left-4 md:top-[4.5rem] md:text-[0.85rem] max-[480px]:left-4 max-[480px]:top-[4.5rem] max-[480px]:text-[0.8rem]"
      target="_blank"
      rel="noopener noreferrer"
      title="Schedule a Zoom Call With Me"
    >
      <span className="flex items-center text-[var(--color-bg-base)] [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-[18px] md:[&_svg]:w-[18px] max-[480px]:[&_svg]:h-4 max-[480px]:[&_svg]:w-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <rect x="7" y="11" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="11" y="11" width="2" height="2" rx="1" fill="currentColor"/>
          <rect x="15" y="11" width="2" height="2" rx="1" fill="currentColor"/>
        </svg>
      </span>
      <span className="font-mono uppercase tracking-[0.08em] text-[var(--color-bg-base)]">Schedule a Call</span>
    </a>
  );
};

export default ScheduleCallButton;
