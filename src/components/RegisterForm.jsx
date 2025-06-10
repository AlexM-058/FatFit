import React, { useState, useEffect } from 'react';
import './RegisterForm.css';
import LoginForm from "./LoginForm";
import { httpRequest } from "../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

const RegisterForm = ({ onBackClick }) => {
  const [quizData, setQuizData] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = () => {
    if (onBackClick) onBackClick(); // Close RegisterForm completely
  };

  useEffect(() => {
    httpRequest(`${API_URL}/quiz`, {
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch quiz');
        return res.json();
      })
      .then(data => setQuizData(data))
      .catch(err => console.error('Error fetching quiz:', err));
  }, []);

  const EmailCheck = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const Checkpass = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleNext = async () => {
    if (step === 1) {
      const { fullname, username, email, password } = formData;
      if (fullname && username && email && password) {
        if (!EmailCheck(email)) {
          alert('Invalid email');
          return;
        }
        if (!Checkpass(password)) {
          alert('Password must be at least 8 characters long, contain one uppercase letter and one special character');
          return;
        }

        try {
          const checkRes = await httpRequest(`${API_URL}/check-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: "include",
            body: JSON.stringify({ username, email }),
          });

          const checkData = await checkRes.json();

          if (checkData.exists) {
            alert('Username sau email deja există!');
            return;
          }
        } catch (err) {
          console.error('Eroare la verificare utilizator:', err);
          alert('A apărut o eroare la verificarea utilizatorului.');
          return;
        }

        setStep(2);
      } else {
        alert('Completează toate câmpurile');
      }
    } else if (step === 2) {
      // Do not allow to proceed without answering the question
      const currentQ = quizData[currentQuestionIndex];
      const answer = formData[currentQ?.question];

      // Check if the current question is conditional and the condition is NOT met
      if (
        currentQ?.conditionalOn &&
        formData[currentQ.conditionalOn.question] !== currentQ.conditionalOn.value
      ) {
        // Skip validation for this question, go to next
        if (currentQuestionIndex < quizData.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setStep(3);
        }
        return;
      }

      const isAnswered =
        currentQ?.type === 'checkbox'
          ? Array.isArray(answer) && answer.length > 0
          : !!answer;

      if (!isAnswered) {
        alert('Please answer the question before continuing.');
        return;
      }

      if (currentQuestionIndex < quizData.length - 1) {
        // Reset text input for next question if type is text
        const nextQ = quizData[currentQuestionIndex + 1];
        if (nextQ && nextQ.type === 'text') {
          setFormData(prev => ({ ...prev, [nextQ.question]: "" }));
        }
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStep(3);
      }
    }
  };


  // Modify handleChange for checkbox to save array of answers
  const handleChange = (question, value, type) => {
    if (type === 'checkbox') {
      setFormData(prev => {
        const prevArr = Array.isArray(prev[question]) ? prev[question] : [];
        if (prevArr.includes(value)) {
          // Deselect
          return { ...prev, [question]: prevArr.filter(v => v !== value) };
        } else {
          // Select
          return { ...prev, [question]: [...prevArr, value] };
        }
      });
    } else {
      setFormData({ ...formData, [question]: value });
    }
  };

  const handleSubmit = async () => {
    const { fullname, username, email, password, ...quizAnswers } = formData;

    try {
      // Check again that all required fields are present before submitting
      if (!fullname || !username || !email || !password) {
        alert("Please complete all fields before submitting.");
        return;
      }
      // Optionally, check that all quiz questions are answered
      const allQuizAnswered = quizData.every(q => {
        // If conditionalOn exists and condition is NOT met, skip validation for this question
        if (q.conditionalOn && formData[q.conditionalOn.question] !== q.conditionalOn.value) {
          return true;
        }
        const answer = formData[q.question];
        return q.type === "checkbox"
          ? Array.isArray(answer) && answer.length > 0
          : !!answer;
      });
      if (!allQuizAnswered) {
        alert("Please answer all quiz questions before submitting.");
        return;
      }

      const registerRes = await httpRequest(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullname, username, email, password }),
      });

      const regData = await registerRes.json();

      if (!registerRes.ok) {
        alert("Registration failed: " + regData.message);
        return;
      }

      const quizRes = await httpRequest(`${API_URL}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, answers: quizAnswers }),
      });

      const quizResult = await quizRes.json();
      if (quizResult.success) {
        alert("Registration and quiz submitted!");
      } else {
        console.log("Quiz submission failed. Backend response:", quizResult);
        if (!quizRes.ok) {
          console.log("Backend returned error status:", quizRes.status, quizRes.statusText);
        } else {
          console.log("Frontend sent data:", { username, answers: quizAnswers });
        }
        alert("Quiz submission failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred.");
    }
  };

  return (
    <div className="register-form">
      {step === 1 && (
        <div className="step-container">
          <div className="Inputs-signup">
            <h2>Step 1: Basic Info</h2>
            <input type="text" placeholder="Full Name" className="form-input" onChange={e => handleChange('fullname', e.target.value)} />
            <input type="text" placeholder="Username" className="form-input" onChange={e => handleChange('username', e.target.value)} />
            <input type="email" placeholder="Email" className="form-input" onChange={e => handleChange('email', e.target.value)} />
           
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="form-input"
                onChange={e => handleChange('password', e.target.value)}
                style={{  }}
              />
              <div
                type="button"
                style={{
                  position: 'absolute',
                  right: '0px',
                  top: '40%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer'
                }}
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
                tabIndex={-1}
              >
                {showPassword ? (
                  <img
                    src="/assets/icons8-eye-50.png"
                    className="eye-icon"
                    style={{ width: '24px', height: '24px' }}
                    alt="hide password"
                  />
                ) : (
                  <img
                    src="/assets/icons8-closed-eye-50.png"
                    className="eye-icon"
                    style={{ width: '24px', height: '24px' }}
                    alt="show password"
                  />
                )}
              </div>
       
          </div>
          <button className="form-button" onClick={handleNext}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div className="step-container">
          <h2>Step 2: Quiz</h2>
          <div className="quiz-question">
            {quizData.length > 0 && quizData[currentQuestionIndex] ? (
              <>
                <p>{quizData[currentQuestionIndex].question}</p>
                {/* Conditional rendering for questions with conditionalOn */}
                {quizData[currentQuestionIndex].conditionalOn ? (() => {
                  const cond = quizData[currentQuestionIndex].conditionalOn;
                  const prevAnswer = formData[cond.question];
                  if (prevAnswer !== cond.value) {
                    // If condition not met, skip to next question
                    setTimeout(() => {
                      setCurrentQuestionIndex(idx => {
                        // Prevent infinite loop
                        if (idx < quizData.length - 1) return idx + 1;
                        return idx;
                      });
                    }, 0);
                    return null;
                  }
                  return null; // Will render below if condition is met
                })() : null}
                {/* Render text input if no conditionalOn or condition is met */}
                {(
                  !quizData[currentQuestionIndex].conditionalOn ||
                  (quizData[currentQuestionIndex].conditionalOn &&
                    formData[quizData[currentQuestionIndex].conditionalOn.question] ===
                      quizData[currentQuestionIndex].conditionalOn.value)
                ) && quizData[currentQuestionIndex].type === 'text' && (
                  <input
                    type="text"
                    className="form-input Input_quiz"
                    value={formData[quizData[currentQuestionIndex].question] || ""}
                    placeholder={quizData[currentQuestionIndex].placeholder || ""}
                    onChange={e =>
                      handleChange(
                        quizData[currentQuestionIndex].question,
                        e.target.value,
                        'text'
                      )
                    }
                    key={quizData[currentQuestionIndex].question + currentQuestionIndex}
                  />
                )}
                {quizData[currentQuestionIndex].type === 'radio' &&
                  quizData[currentQuestionIndex].options.map((option, idx) => (
                    <label key={idx} className='radio-label'>
                      <input
                        type="radio"
                        name={quizData[currentQuestionIndex].question}
                        value={option}
                        checked={formData[quizData[currentQuestionIndex].question] === option}
                        onChange={e =>
                          handleChange(
                            quizData[currentQuestionIndex].question,
                            e.target.value,
                            'radio'
                          )
                        }
                      />
                      {option}
                    </label>
                  ))}
                {quizData[currentQuestionIndex].type === 'checkbox' &&
                  quizData[currentQuestionIndex].options.map((option, idx) => (
                    <label key={idx} className='checkbox-label'>
                      <input
                        type="checkbox"
                        name={quizData[currentQuestionIndex].question}
                        value={option}
                        checked={
                          Array.isArray(formData[quizData[currentQuestionIndex].question]) &&
                          formData[quizData[currentQuestionIndex].question].includes(option)
                        }
                        onChange={() =>
                          handleChange(
                            quizData[currentQuestionIndex].question,
                            option,
                            'checkbox'
                          )
                        }
                      />
                      {option}
                    </label>
                  ))}
              </>
            ) : (
              <p>Loading quiz...</p>
            )}
          </div>
          <div className="form-navigation">
            <button
              className='form-button next-btn'
              onClick={handleNext}
              disabled={(() => {
                const currentQ = quizData[currentQuestionIndex];
                const answer = formData[currentQ?.question];
                const isAnswered =
                  currentQ?.type === 'checkbox'
                    ? Array.isArray(answer) && answer.length > 0
                    : !!answer;
                return !isAnswered;
              })()}
            >
              {currentQuestionIndex === quizData.length - 1 ? 'Next' : 'Next Question'}
            </button>
            <button className="cancel-button" onClick={onBackClick}>Cancel</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="step-container">
          <h2>Step 3: Review & Submit</h2>
          <div className="form-review">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}><strong>{key}:</strong> {value.toString()}</div>
            ))}
          </div>
          <div className="form-navigation">
            <button
              className='form-button submit-btn'
              onClick={() => { handleSubmit(); handleLoginSubmit(); }}
            >
              Submit
            </button>
            <button className="cancel-button" onClick={onBackClick}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ textAlign: "center"}}>
        <button
          className="form-button login-btn"
          onClick={handleLoginSubmit}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
