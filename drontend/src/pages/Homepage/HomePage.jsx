import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Navbar_frame from "../../Components/Navbar_frame";

const HomePage = () => {
  return (
    <div className="homePage">
      <div className="homeShell">
        <div className="navbar_frame">
          <Navbar_frame />
        </div>

        <main className="homeMain">
          <section className="heroSection">
            <div className="heroContent">
              <p className="heroBadge">AI Powered Plant Health Platform</p>
              <h1>Detect plant diseases faster and guide users with clear care advice.</h1>
              <p className="heroText">
                Upload a leaf image, get an instant prediction, and view medicine,
                treatment, and care guidance in a clean dashboard experience.
              </p>

              <div className="heroActions">
                <Link to="/predictionPage" className="primaryBtn">Start Prediction</Link>
                <Link to="/Dashboard" className="secondaryBtn">Open Dashboard</Link>
              </div>
            </div>

            <div className="heroVisual">
              <div className="heroCard">
                <span className="heroStat">AI Prediction</span>
                <strong>Fast disease detection from leaf images</strong>
              </div>
              <div className="heroCard">
                <span className="heroStat">Smart Advice</span>
                <strong>Get care steps, medicine, and treatment guidance</strong>
              </div>
              <div className="heroCard">
                <span className="heroStat">Saved Reports</span>
                <strong>Track all predictions in your dashboard</strong>
              </div>
            </div>
          </section>

          <section className="infoRow leftImage">
            <div className="infoImage">
              <img
                src="https://picsum.photos/seed/plant-leaf/900/700"
                alt="Plant leaf analysis"
              />
            </div>

            <div className="infoContent">
              <p className="sectionTag">Prediction Page</p>
              <h2>Upload plant images and get instant disease results.</h2>
              <p>
                The prediction page is where users upload a leaf image, run the AI model,
                and see the detected disease with confidence and treatment guidance.
              </p>
              <Link to="/predictionPage" className="textLink">Go to Prediction</Link>
            </div>
          </section>

          <section className="infoRow rightImage">
            <div className="infoContent">
              <p className="sectionTag">Dashboard</p>
              <h2>View all saved predictions in one clean place.</h2>
              <p>
                The dashboard stores your previous predictions, shows disease details,
                and lets you delete one record or clear all saved data at once.
              </p>
              <Link to="/Dashboard" className="textLink">Go to Dashboard</Link>
            </div>

            <div className="infoImage">
              <img
                src="https://picsum.photos/seed/dashboard-green/900/700"
                alt="Plant dashboard"
              />
            </div>
          </section>

          <section className="infoRow leftImage">
            <div className="infoImage">
              <img
                src="https://picsum.photos/seed/about-plants/900/700"
                alt="About the plant disease app"
              />
            </div>

            <div className="infoContent">
              <p className="sectionTag">About Us</p>
              <h2>Built to make crop care easier and more accessible.</h2>
              <p>
                This app is designed for farmers, agriculture students, and plant care
                users who want a simple way to identify diseases and take action quickly.
              </p>
              <Link to="/Aboutus" className="textLink">Go to About Us</Link>
            </div>
          </section>

          <section className="bottomBanner">
            <div>
              <h2>One app for detection, guidance, and saved records.</h2>
              <p>
                Navigate between prediction, dashboard, and about pages using the same
                nature-inspired visual theme.
              </p>
            </div>

            <div className="bannerLinks">
              <Link to="/predictionPage" className="bannerBtn">Prediction</Link>
              <Link to="/Dashboard" className="bannerBtn">Dashboard</Link>
              <Link to="/Aboutus" className="bannerBtn">About Us</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomePage;