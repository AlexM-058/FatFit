import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

    fetch(`${API_URL}/api/fitness-tribe/workout/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
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
    return <div style={{ margin: 32 }}>Loading workout plan...</div>;
  }
  if (error) {
    return <div style={{ color: "red", margin: 32 }}>{error}</div>;
  }
  if (!workout) {
    return <div style={{ margin: 32 }}>No workout plan available.</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0002", padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Your AI Workout Plan</h2>
      <div style={{ marginBottom: 24 }}>
        <h3>Warmup</h3>
        <div>
          <strong>Description:</strong> {workout.warmup?.description}
        </div>
        <div>
          <strong>Duration:</strong> {workout.warmup?.duration} min
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Cardio</h3>
        <div>
          <strong>Description:</strong> {workout.cardio?.description}
        </div>
        <div>
          <strong>Duration:</strong> {workout.cardio?.duration} min
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Workout Sessions (per week: {workout.sessions_per_week})</h3>
        {Array.isArray(workout.workout_sessions) && workout.workout_sessions.map((session, idx) => (
          <div key={idx} style={{ marginBottom: 18, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Session {idx + 1}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 6, border: "1px solid #ddd" }}>Exercise</th>
                  <th style={{ padding: 6, border: "1px solid #ddd" }}>Sets</th>
                  <th style={{ padding: 6, border: "1px solid #ddd" }}>Reps</th>
                  <th style={{ padding: 6, border: "1px solid #ddd" }}>Rest (sec)</th>
                </tr>
              </thead>
              <tbody>
                {session.exercises.map((ex, i) => (
                  <tr key={i}>
                    <td style={{ padding: 6, border: "1px solid #ddd" }}>{ex.name}</td>
                    <td style={{ padding: 6, border: "1px solid #ddd" }}>{ex.sets}</td>
                    <td style={{ padding: 6, border: "1px solid #ddd" }}>{ex.reps}</td>
                    <td style={{ padding: 6, border: "1px solid #ddd" }}>{ex.rest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div>
        <h3>Cooldown</h3>
        <div>
          <strong>Description:</strong> {workout.cooldown?.description}
        </div>
        <div>
          <strong>Duration:</strong> {workout.cooldown?.duration} min
        </div>
      </div>
    </div>
  );
};

export default WorkoutMain;
