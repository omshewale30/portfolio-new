"use client"
import { useRef, useState } from "react"
import emailjs from "@emailjs/browser"
import { motion } from "framer-motion"
import ScheduleCallButton from "./ScheduleCallButton"
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations"

const ContactSection = () => {
  const form = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const sendEmail = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await emailjs.sendForm(
        "service_zfvhjwe", // Replace with your EmailJS service ID
        "template_qt3tvqw", // Replace with your EmailJS template ID
        form.current,
        "G5A2_HEaFryYJN8RH", // Replace with your EmailJS public key
      )

      setSubmitStatus("success")
      console.log(result.text)
      e.target.reset()
    } catch (error) {
      setSubmitStatus("error")
      console.error(error)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  const contactInfo = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: "Phone",
      value: "+1 (206)-637-8859",
      href: "tel:+12066378859",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Email",
      value: "omshewale030@gmail.com",
      href: "mailto:omshewale030@gmail.com",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Location",
      value: "Chapel Hill, NC",
      href: "https://maps.google.com/?q=Chapel+Hill,+NC",
    },
  ]

  return (
    <footer
      className="relative overflow-hidden bg-[var(--color-bg-base)]"
      id="contact"
    >
      <div className="section-shell relative z-10">
        <motion.div
          className="mb-12"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">// Contact</p>
          <h2 className="font-display mb-4 text-4xl italic tracking-[-0.01em] text-[var(--color-text-primary)] max-md:text-[2.5rem] max-[480px]:text-[2rem]">
            Philosophy, Fitness, Technology, or Life? Let&apos;s talk.
          </h2>
          <p className="max-w-[760px] text-xl leading-relaxed text-[var(--color-text-muted)] max-md:text-[1.1rem]">
            I love to chat about anything and everything.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 items-start gap-[60px] max-md:grid-cols-1 max-md:gap-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Contact Information */}
          <motion.div
            className="surface-card relative overflow-hidden p-10 max-md:px-6 max-md:py-8 max-[480px]:px-5 max-[480px]:py-6"
            variants={cardReveal}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-muted)] to-transparent" />
            <h3 className="font-display mb-3 text-[1.75rem] text-[var(--color-text-primary)] max-[480px]:text-2xl">Get in Touch</h3>
            <p className="mb-8 leading-relaxed text-[var(--color-text-muted)]">
              Feel free to reach out through any of these channels. I typically respond within 24 hours.
            </p>

            <div className="mb-10 flex flex-col gap-5">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4 text-inherit transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary-muted)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 max-[480px]:p-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-primary)] max-[480px]:h-10 max-[480px]:w-10">
                    {item.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">{item.label}</span>
                    <span className="text-base font-semibold text-[var(--color-text-primary)]">{item.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="mb-10 flex flex-wrap items-center gap-3"
              style={{ marginTop: "0.5rem" }}
            >
              <ScheduleCallButton inline />
            </div>

            <div className="border-t border-[var(--color-border-muted)] pt-8">
              <h4 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Follow Me</h4>
              <div className="flex justify-start gap-3 max-md:justify-center">
                <a
                  href="https://www.linkedin.com/in/omshewale/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 max-[480px]:h-10 max-[480px]:w-10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8V8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="https://github.com/omshewale"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 max-[480px]:h-10 max-[480px]:w-10"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 19C4 20.5 4 16.5 2 16M22 16V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H16C15.4696 21 14.9609 20.7893 14.5858 20.4142C14.2107 20.0391 14 19.5304 14 19V16.13C14.0375 15.6532 13.9731 15.1738 13.811 14.7238C13.6489 14.2738 13.3929 13.8634 13.06 13.52C16.2 13.17 19.5 11.98 19.5 6.52C19.4997 5.12383 18.9627 3.7812 18 2.77C18.4559 1.54851 18.4236 0.196583 17.91 -0.999996C17.91 -0.999996 16.73 -1.35 14 0.499996C11.708 -0.0596719 9.29196 -0.0596719 7 0.499996C4.27 -1.35 3.09 -0.999996 3.09 -0.999996C2.57638 0.196583 2.54414 1.54851 3 2.77C2.03013 3.78866 1.49252 5.1434 1.5 6.55C1.5 11.97 4.8 13.16 7.94 13.53C7.611 13.8714 7.35726 14.2769 7.19531 14.7224C7.03335 15.1679 6.96681 15.6441 7 16.12V19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="surface-card relative overflow-hidden p-10 max-md:px-6 max-md:py-8 max-[480px]:px-5 max-[480px]:py-6"
            variants={cardReveal}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-muted)] to-transparent" />
            <h3 className="font-display mb-3 text-[1.75rem] text-[var(--color-text-primary)] max-[480px]:text-2xl">Send a Message</h3>
            <p className="mb-8 leading-relaxed text-[var(--color-text-muted)]">I&apos;ll respond within 24 hours.</p>

            <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="from_name" className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">Name</label>
                  <input
                    type="text"
                    id="from_name"
                    name="from_name"
                    placeholder="Your name"
                    required
                    className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-4 text-base text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-meta)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="from_email" className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">Email</label>
                  <input
                    type="email"
                    id="from_email"
                    name="from_email"
                    placeholder="your.email@example.com"
                    required
                    className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-4 text-base text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-meta)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Subject of your message"
                  required
                  className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-4 text-base text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-meta)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="What do you want to chat about?"
                  rows="5"
                  required
                  className="min-h-[120px] resize-y rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-4 text-base text-[var(--color-text-primary)] transition-all duration-300 placeholder:text-[var(--color-text-meta)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                />
              </div>

              <button
                type="submit"
                className="btn-primary group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-4 text-base disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.25"
                      />
                      <path
                        d="M21 12C21 7.02944 16.9706 3 12 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polygon points="22,2 15,22 11,13 2,9 22,2" fill="currentColor" />
                    </svg>
                  </>
                )}
              </button>

              {submitStatus && (
                <div
                  className={`animate-[slide-in_0.3s_ease-out] flex items-center gap-2 rounded-xl border p-4 font-medium ${
                    submitStatus === "success"
                      ? "border-[var(--color-border-subtle)] bg-[rgba(200,168,130,0.15)] text-[var(--color-primary)]"
                      : "border-[var(--color-border-subtle)] bg-[rgba(130,82,58,0.18)] text-[#f1c2a0]"
                  }`}
                >
                  {submitStatus === "success" ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Message sent successfully! I'll get back to you soon.
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Something went wrong. Please try again or contact me directly.
                    </>
                  )}
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>
      <div className="border-t border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]/60">
        <div className="mx-auto flex max-w-[72rem] flex-wrap items-center justify-between gap-4 px-6 py-5 text-sm text-[var(--color-text-subtle)]">
          <p className="font-mono tracking-[0.04em]">Om Shewale | AI Engineer | 2026</p>
          <nav className="flex items-center gap-5">
            <a href="#home" className="transition-colors duration-300 hover:text-[var(--color-primary)]">Home</a>
            <a href="#projects" className="transition-colors duration-300 hover:text-[var(--color-primary)]">Projects</a>
            <a href="#experience" className="transition-colors duration-300 hover:text-[var(--color-primary)]">Experience</a>
            <a href="#contact" className="transition-colors duration-300 hover:text-[var(--color-primary)]">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default ContactSection
