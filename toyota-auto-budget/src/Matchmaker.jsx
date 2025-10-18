import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

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

// simplified Toyota personality matrix
const cars = [
  { name: "Corolla", traits: { eco: 4, performance: 3, comfort: 5, innovation: 3, style: 3 } },
  { name: "Corolla Hybrid", traits: { eco: 6, performance: 3, comfort: 5, innovation: 4, style: 3 } },
  { name: "Corolla Hatchback", traits: { eco: 4, performance: 4, comfort: 4, innovation: 3, style: 5 } },
  { name: "Prius", traits: { eco: 7, performance: 3, comfort: 5, innovation: 6, style: 4 } },
  { name: "Prius Plug-in Hybrid", traits: { eco: 7, performance: 3, comfort: 5, innovation: 7, style: 4 } },
  { name: "Camry", traits: { eco: 5, performance: 4, comfort: 7, innovation: 5, style: 4 } },
  { name: "GR 86", traits: { eco: 2, performance: 7, comfort: 3, innovation: 3, style: 6 } },
  { name: "GR Corolla", traits: { eco: 3, performance: 7, comfort: 3, innovation: 4, style: 6 } },
  { name: "GR Supra", traits: { eco: 2, performance: 7, comfort: 4, innovation: 4, style: 7 } },
  { name: "Sienna", traits: { eco: 4, performance: 3, comfort: 7, innovation: 5, style: 3 } },
  { name: "Crown", traits: { eco: 5, performance: 5, comfort: 6, innovation: 6, style: 6 } },
  { name: "Mirai", traits: { eco: 7, performance: 3, comfort: 5, innovation: 7, style: 4 } },
];

// helper function to compute similarity
function distance(user, car) {
  const keys = Object.keys(car);
  let sum = 0;
  for (const k of keys) {
    sum += (user[k] - car[k]) ** 2;
  }
  return Math.sqrt(sum);
}

function Matchmaker() {
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
    // aggregate trait scores
    const totals = { eco: 0, performance: 0, comfort: 0, innovation: 0, style: 0 };
    const counts = { eco: 0, performance: 0, comfort: 0, innovation: 0, style: 0 };

    for (const q of questions) {
      const score = answers[q.id] || 4; // default neutral
      for (const [trait, weight] of Object.entries(q.traits)) {
        totals[trait] += score * weight;
        counts[trait] += weight;
      }
    }

    const userProfile = {};
    for (const key in totals) {
      userProfile[key] = counts[key] ? totals[key] / counts[key] : 0;
    }

    // find best match
    let best = null;
    let bestDist = Infinity;
    for (const car of cars) {
      const d = distance(userProfile, car.traits);
      if (d < bestDist) {
        bestDist = d;
        best = car.name;
      }
    }

    setResult({ car: best, profile: userProfile });
  };

  // UI
  if (result) {
    return (
      <div className="container">
        <h1>Your Toyota Match</h1>
        <h2>{result.car}</h2>
        <p>
          Based on your preferences, the <b>{result.car}</b> fits your driving personality best!
        </p>
        <Link to="/">
          <button className="nav-button">Back to Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
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
