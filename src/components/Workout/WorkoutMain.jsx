import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { httpRequest } from "../../utils/http";
import "./WorkoutMain.css";
const API_URL = import.meta.env.VITE_API_URL;

const WorkoutMain = () => {
  const { username } = useParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    const localKey = `ai_workout_${username}`;
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          setWorkout(parsed);
          setLoading(false);
          setError(null);
          return;
        }
      } catch (err) {
        console.error("LocalStorage parse error:", err);
        // ignore parse error, fallback to fetch
      }
    }

    httpRequest(`${API_URL}/api/fitness-tribe/workout/${username}`, {
      method: "POST",
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Workout API error:", res.status, text);
          throw new Error(`Failed to fetch workout plan (status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setWorkout(data);
        // Save to localStorage
        localStorage.setItem(localKey, JSON.stringify(data));
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div className="workout-loading">Loading workout plan...</div>;
  }
  if (error) {
    return <div className="workout-error">{error}</div>;
  }
  if (!workout) {
    return <div className="workout-empty">No workout plan available.</div>;
  }

  return (
    <div className="workout-main-container">
      <h2 className="workout-title">Your AI Workout Plan</h2>
      <div className="workout-section">
        <h3 className="workout-section-title">Warmup</h3>
        <div className="workout-section-content">
          <strong>Description:</strong> {workout.warmup?.description}
        </div>
        <div className="workout-section-content">
          <strong>Duration:</strong> {workout.warmup?.duration} min
        </div>
      </div>
      <div className="workout-section">
        <h3 className="workout-section-title">Cardio</h3>
        <div className="workout-section-content">
          <strong>Description:</strong> {workout.cardio?.description}
        </div>
        <div className="workout-section-content">
          <strong>Duration:</strong> {workout.cardio?.duration} min
        </div>
      </div>
      <div className="workout-section">
        <h3 className="workout-section-title">
          Workout Sessions (per week: {workout.sessions_per_week})
        </h3>
        {Array.isArray(workout.workout_sessions) && workout.workout_sessions.map((session, idx) => (
          <div className="workout-table-container" key={idx}>
            <h4 style={{ margin: "0 0 8px 0" }}>Session {idx + 1}</h4>
            <table>
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Rest (sec)</th>
                </tr>
              </thead>
              <tbody>
                {session.exercises.map((ex, i) => (
                  <tr key={i}>
                    <td>{ex.name}</td>
                    <td>{ex.sets}</td>
                    <td>{ex.reps}</td>
                    <td>{ex.rest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="workout-section">
        <h3 className="workout-section-title">Cooldown</h3>
        <div className="workout-section-content">
          <strong>Description:</strong> {workout.cooldown?.description}
        </div>
        <div className="workout-section-content">
          <strong>Duration:</strong> {workout.cooldown?.duration} min
        </div>
      </div>
    </div>
  );
};

export default WorkoutMain;
