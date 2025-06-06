"use client"
import { useRef, useState } from "react"
import emailjs from "@emailjs/browser"
import "../CSS/ContactSection.css"

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
    <footer className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">Let's Connect</h2>
          <p className="contact-subtitle">
            Ready to collaborate on your next project? I'd love to hear from you and discuss how we can work together.
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info-card">
            <h3 className="info-card-title">Get in Touch</h3>
            <p className="info-card-description">
              Feel free to reach out through any of these channels. I typically respond within 24 hours.
            </p>

            <div className="contact-info">
              {contactInfo.map((item, index) => (
                <a key={index} href={item.href} className="contact-item" target="_blank" rel="noopener noreferrer">
                  <div className="contact-icon">{item.icon}</div>
                  <div className="contact-details">
                    <span className="contact-label">{item.label}</span>
                    <span className="contact-value">{item.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="social-links">
              <h4>Follow Me</h4>
              <div className="contact-social-icons">
                <a href="https://www.linkedin.com/in/omshewale/" target="_blank" rel="noopener noreferrer" className="contact-social-link">
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
                <a href="https://github.com/omshewale" target="_blank" rel="noopener noreferrer" className="contact-social-link">
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
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <h3 className="form-card-title">Send a Message</h3>
            <p className="form-card-description">Have a project in mind? Let's discuss how we can bring your ideas to life.</p>

            <form ref={form} onSubmit={sendEmail} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="from_name">Name</label>
                  <input type="text" id="from_name" name="from_name" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="from_email">Email</label>
                  <input type="email" id="from_email" name="from_email" placeholder="your.email@example.com" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" placeholder="What's this about?" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" placeholder="Tell me about your project..." rows="5" required></textarea>
              </div>

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div className={`status-message ${submitStatus}`}>
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
          </div>
        </div>
      </div>
    </footer>
  )
}

export default ContactSection
