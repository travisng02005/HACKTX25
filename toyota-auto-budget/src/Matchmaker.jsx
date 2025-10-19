import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import rav4 from "./assets/rav4.png";


// --- Toyota Progress Bar Component ---
function ToyotaProgressBar({ step, totalSteps }) {
  const progress = Math.min(step / (totalSteps - 1), 1); // 0 → 1
  const carPosition = `${progress * 95}%`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100px",
        background: "linear-gradient(to bottom, #fff, #f8f9fa)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ position: "relative", width: "90%", height: "8px" }}>
        {/* Track */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "10px",
            transform: "translateY(-50%)",
          }}
        />

        {/* Finish Line */}
        <div
          style={{
            position: "absolute",
            right: "-15px",
            top: "50%",
            transform: "translateY(-50%)",
            textAlign: "center",
          }}
        >
          <div style={{ height: "50px", width: "3px", background: "#111" }}></div>
          <div style={{ fontSize: "18px", marginTop: "4px" }}>🏁</div>
        </div>

        {/* Car (moves along progress) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: carPosition,
            transform: "translate(-50%, -60%)",
            transition: "left 0.6s ease-in-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: carPosition,
              transform: "translate(-50%, -50%)",
              transition: "left 0.6s ease-in-out",
            }}
          >
            <img
              src={rav4}
              alt="Toyota RAV4"
              style={{ width: "100px", height: "auto" }}
            />
            <div style={{ fontSize: "10px", color: "#555", textAlign: "center" }}>
              {Math.round(progress * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Quiz Questions ---
const questions = [
  { id: 1, text: "I value fuel efficiency and sustainability above all else.", traits: { eco: 1 } },
  { id: 2, text: "I prefer a compact car that's easy to park and maneuver in the city.", traits: { comfort: 0.5, style: 0.5 } },
  { id: 3, text: "I enjoy taking spirited drives and want my car to feel sporty.", traits: { performance: 1 } },
  { id: 4, text: "I prioritize comfort, space, and family-friendly design.", traits: { comfort: 1 } },
  { id: 5, text: "I’m drawn to cutting-edge technology and futuristic design.", traits: { innovation: 1 } },
  { id: 6, text: "I see my car as an expression of style and individuality.", traits: { style: 1 } },
  { id: 7, text: "I prefer a hybrid or electric powertrain over gasoline engines.", traits: { eco: 1, innovation: 0.5 } },
  { id: 8, text: "I often drive long distances and want a smooth, quiet ride.", traits: { comfort: 1 } },
  { id: 9, text: "I like being ready for road trips, carpools, or hauling gear.", traits: { comfort: 1 } },
  { id: 10, text: "I appreciate cars that feel exclusive or performance-tuned.", traits: { performance: 0.7, style: 0.3 } },
  { id: 11, text: "I want a car that helps me save money over time.", traits: { eco: 1, comfort: 0.5 } },
  { id: 12, text: "I like trying innovative or less common technologies (like hydrogen).", traits: { innovation: 1 } },
];

const cars = [
  { name: "RAV4", msrp: 35000 },
];

function Matchmaker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const currentQuestion = questions[step];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const rav4 = cars.find((car) => car.name === "RAV4");
    setResult({ car: rav4 });
  };

  // --- RESULT SCREEN ---
  if (result) {
    const handleBuildRAV4 = () => {
      window.open("https://www.toyota.com/configurator/build/step/model/year/2025/series/rav4/", "_blank");
      navigate("/questionnaire", {
        state: {
          prefilledData: {
            model: result.car.name,
            msrp: result.car.msrp.toString(),
            make: "Toyota",
            year: "2025",
          },
        },
      });
    };

    return (
      <div className="container" style={{ marginTop: "120px" }}>
        <ToyotaProgressBar step={questions.length - 1} totalSteps={questions.length} />
        <h1>Your Toyota Match</h1>
        <h2>{result.car.name}</h2>
        <p>
          Based on your preferences, the <b>{result.car.name}</b> fits your driving personality best!
        </p>
        <p>
          Starting MSRP: <strong>${result.car.msrp.toLocaleString()}</strong>
        </p>
        <div className="button-container">
          <button className="nav-button external-button" onClick={handleBuildRAV4}>
            Build Your RAV4 & Get Quote
          </button>
          <Link to="/">
            <button className="nav-button">Back to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  // --- QUIZ SCREEN ---
  return (
    <div className="container" style={{ marginTop: "120px" }}>
      <ToyotaProgressBar step={step} totalSteps={questions.length} />
      <h1>Matchmaker</h1>
      <p>
        Question {step + 1} of {questions.length}
      </p>
      <h2>{currentQuestion.text}</h2>

      <div className="slider-row">
        <span>Strongly Disagree</span>
        <input
          type="range"
          min="1"
          max="7"
          value={answers[currentQuestion.id] || 4}
          onChange={(e) => handleAnswer(Number(e.target.value))}
          style={{ width: "100%", margin: "1.5rem 0" }}
        />
        <span>Strongly Agree</span>
      </div>

      <div className="button-container">
        {step > 0 && (
          <button className="nav-button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button className="nav-button" onClick={handleNext}>
          {step === questions.length - 1 ? "See My Match" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default Matchmaker;
