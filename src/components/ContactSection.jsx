
import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import "../CSS/ContactSection.css";

const ContactSection = () => {
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        emailjs
            .sendForm(
                "service_zfvhjwe", // Replace with your EmailJS service ID
                "template_qt3tvqw", // Replace with your EmailJS template ID
                form.current,
                "G5A2_HEaFryYJN8RH" // Replace with your EmailJS public key
            )
            .then(
                (result) => {
                    alert("Message sent successfully!");
                    console.log(result.text);


                },
                (error) => {
                    alert("An error occurred. Please try again.");
                    console.error(error);
                }
            );

        e.target.reset();
    };

    return (
        <footer className="contact-section" id="contact">
            <div className="contact-container">
                <h2>Contact Me</h2>
                <p>I'd love to connect with you! Feel free to reach out to me anytime.</p>

                {/* Contact Information */}
                <div className="contact-info">
                    <div className="contact-item">
                        <i className="fas fa-phone-alt"></i>
                        <span>+1 (206)-637-8859</span>
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        <span>omshewale030@gmail.com</span>
                    </div>
                    <div className="contact-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>Chapel Hill, NC</span>
                    </div>
                </div>

                {/* Contact Form */}
                <form ref={form} onSubmit={sendEmail} className="contact-form">
                    <div className="form-row">
                        <input type="text" name="from_name" placeholder="Your Name" required />
                        <input type="email" name="from_email" placeholder="Your Email" required />
                    </div>
                    <input type="text" name="subject" placeholder="Subject" required />
                    <textarea name="message" placeholder="Message" rows="5" required></textarea>
                    <button type="submit" className="submit-button">
                        Send Message
                    </button>
                </form>
            </div>
        </footer>
    );
};

export default ContactSection;
