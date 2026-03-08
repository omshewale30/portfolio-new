import React, { useState, useEffect } from "react";

const HeroSection = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const normalisedScroll = Math.min(Math.max(scrollPosition / windowHeight, 0), 1);
      setScroll(normalisedScroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="about"
      className="relative flex min-h-screen items-center overflow-hidden bg-[var(--color-bg-base)]"
    >
      <div className="section-shell relative z-10">
        <div className="surface-card relative overflow-hidden px-8 py-12 md:px-12 md:py-14 max-md:px-6 max-md:py-10 max-[480px]:px-5 max-[480px]:py-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-muted)] to-transparent" />

          <div className="flex flex-col items-center">
            <div
              className="relative mb-8 flex h-[280px] w-[280px] shrink-0 items-center justify-center md:mb-10 md:h-[320px] md:w-[320px] max-md:mb-6 max-md:h-[220px] max-md:w-[220px] max-[480px]:h-[180px] max-[480px]:w-[180px]"
            >
              <div className="absolute inset-0 rounded-full border border-[var(--color-border-subtle)] p-[4px]">
                <div className="h-full w-full overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                  <img
                    src="/assets/Hero.jpeg"
                    alt="Om Shewale"
                    className="h-full w-full object-cover object-[center_top] transition-transform duration-500 ease-out"
                    style={{
                      transform: `scale(${0.85 + scroll * 0.15})`,
                      opacity: Math.max(0.6, scroll),
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="eyebrow-label mb-4">// About</p>
            <h2
              className="font-display mb-4 text-center text-3xl tracking-tight text-[var(--color-text-primary)] md:mb-5 md:text-5xl max-md:text-2xl max-[480px]:text-xl"
            >
              Hi, I&apos;m Om Shewale
            </h2>

            <p
              className="max-w-[40rem] text-center text-[1.05rem] leading-[1.75] text-[var(--color-text-muted)] md:text-[1.2rem] max-md:text-[0.95rem] max-[480px]:text-[0.9rem]"
            >
              A software developer passionate about solving problems through AI and computer vision.
              Outside of coding, I enjoy lifting weights, playing football, exploring the outdoors, and
              recently, I&apos;ve developed a love for pool. My journey blends technical expertise with
              creativity, and I'm driven to make an impact through innovative solutions. Welcome to my
              portfolio!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
