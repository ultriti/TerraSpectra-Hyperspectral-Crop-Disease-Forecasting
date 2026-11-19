import React from "react";
import "./AboutUs.css";
import Navbar_frame from "../../Components/Navbar_frame";
import img_ from "../../../public/image/Gemini_Generated_Image_hc5qnvhc5qnvhc5q.png"

const AboutUs = () => {
  return (
    <div className="aboutPage">
      <div className="aboutShell">
        <div className="navbar_frame">
          <Navbar_frame />
        </div>

        <main className="aboutMain">
          <section className="heroSection">
            <div className="heroBadge">
              <img src={img_} alt="" />
            </div>
            <h1>Smarter Plant Disease Detection for Healthier Crops</h1>
            <p className="heroText">
              Our app helps farmers, growers, and agricultural teams identify
              plant diseases early using AI-powered image prediction. It
              provides disease insights, treatment guidance, and practical care
              steps so users can take action faster and protect crop health.
            </p>
          </section>

          <section className="featureGrid">
            <article className="featureCard">
              <h2>What We Do</h2>
              <p>
                Users upload a plant leaf image, and our model predicts the
                disease or health status. Based on the result, the app displays
                disease-specific advice, medicines, and care recommendations.
              </p>
            </article>

            <article className="featureCard">
              <h2>Why It Matters</h2>
              <p>
                Early disease detection can reduce crop loss, lower treatment
                cost, and improve overall plant survival. Our goal is to make
                that process simple, fast, and accessible.
              </p>
            </article>

            <article className="featureCard">
              <h2>Built For</h2>
              <p>
                Farmers, agriculture students, researchers, and anyone who
                wants a quick plant health check with clear next steps.
              </p>
            </article>
          </section>

          <section className="storySection">
            <div className="storyCard">
              <h2>Our Mission</h2>
              <p>
                We want to make plant disease diagnosis easier using modern AI
                tools and clean, useful guidance. Instead of confusing users
                with technical details, the app turns predictions into practical
                care actions.
              </p>
            </div>

            <div className="storyCard">
              <h2>How It Works</h2>
              <ul>
                <li>Upload a leaf image.</li>
                <li>AI predicts the disease class.</li>
                <li>The app maps the result to advice.</li>
                <li>Users get treatment and care guidance instantly.</li>
              </ul>
            </div>
          </section>

          <section className="ctaSection">
            <div>
              <h2>Built to support better decisions in the field</h2>
              <p>
                A simple interface, fast prediction flow, and actionable
                guidance make the app useful for real-world crop care.
              </p>
            </div>

            <div className="ctaPills">
              <span>AI Prediction</span>
              <span>Crop Health</span>
              <span>Care Guidance</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AboutUs;