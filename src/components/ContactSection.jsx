import { useRef, useState } from "react"
import emailjs from "@emailjs/browser"
import { motion } from "framer-motion"
import { Check, Github, Instagram, Linkedin, LoaderCircle, Mail, MapPin, Send, TriangleAlert } from "lucide-react"
import { cardReveal, fadeInUp, revealOnView, staggerContainer } from "../utils/animations"
import { EMAIL, LOCATION, mapsHref, socials } from "../data/contact"

const contactLinks = [
  { icon: Mail, value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: Linkedin, value: socials.linkedin.handle, href: socials.linkedin.href },
  { icon: Github, value: socials.github.handle, href: socials.github.href },
  { icon: Instagram, value: `@${socials.instagram.handle}`, href: socials.instagram.href },
  { icon: MapPin, value: LOCATION, href: mapsHref },
]

const ContactSection = () => {
  const form = useRef()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const sendEmail = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
      setSubmitStatus("success")
      e.target.reset()
    } catch (error) {
      setSubmitStatus("error")
      console.error(error)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus(null), 5000)
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-20">
      <motion.div
        className="mx-auto grid max-w-[var(--container-max)] gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-12 lg:py-24"
        variants={staggerContainer}
        {...revealOnView}
      >
        <motion.div className="flex flex-col gap-[18px]" variants={fadeInUp}>
          <p className="eyebrow-label eyebrow-pill m-0">Open channel</p>
          <h2 id="contact-heading" className="headline m-0 text-[36px] leading-[1.05] text-[var(--color-text-primary)] sm:text-5xl">
            Philosophy, fitness, technology, or life? Let&apos;s talk.
          </h2>
          <p className="m-0 text-[15px] text-[var(--color-text-subtle)]">
            I love to chat about anything and everything.
          </p>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {contactLinks.map(({ icon: Icon, value, href }) => (
              <a
                key={value}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="btn-ghost"
              >
                <Icon size={14} className="text-[var(--color-text-subtle)]" aria-hidden="true" />
                {value}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.form
          ref={form}
          onSubmit={sendEmail}
          variants={cardReveal}
          className="flex flex-col gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-[22px]"
          aria-label="Send Om a message"
        >
          <span className="font-mono text-xs text-[var(--color-text-meta)]">new message → om</span>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="flex flex-col">
              <span className="sr-only">Name</span>
              <input type="text" name="from_name" placeholder="Name" autoComplete="name" required className="field-input" />
            </label>
            <label className="flex flex-col">
              <span className="sr-only">Email</span>
              <input type="email" name="from_email" placeholder="Email" autoComplete="email" required className="field-input" />
            </label>
          </div>
          <input type="hidden" name="subject" value="New message from omshewale.com" />
          <label className="flex flex-col">
            <span className="sr-only">Message</span>
            <textarea name="message" placeholder="What are you curious about?" rows="5" required className="field-input min-h-[120px]" />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <p className="m-0 mr-auto flex items-center gap-2 text-[13px] text-[var(--color-text-subtle)]" role="status">
              {submitStatus === "success" ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  Sent. I&apos;ll get back to you soon.
                </>
              ) : null}
              {submitStatus === "error" ? (
                <>
                  <TriangleAlert size={14} aria-hidden="true" />
                  That didn&apos;t send. Try again, or email me directly.
                </>
              ) : null}
            </p>
            <button type="submit" className="btn-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Sending
                  <LoaderCircle size={14} className="spin-step" aria-hidden="true" />
                </>
              ) : (
                <>
                  Transmit
                  <Send size={14} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </section>
  )
}

export default ContactSection
