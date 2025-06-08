import React, { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const Lunch = ({ username }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/caloriecounter/${username}/lunch`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch lunch foods");
        return res.json();
      })
      .then(data => {
        setFoods(Array.isArray(data.foods) ? data.foods : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div>Loading lunch foods...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", background: "#f9f9f9", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px #0001" }}>
      <h3 style={{ textAlign: "center" }}>Lunch Foods</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {foods.length === 0 ? (
          <li>No lunch foods found.</li>
        ) : (
          foods.map((food, idx) => (
            <li key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "6px 0" }}>
              <span>{food.name}</span>
              <span style={{ fontWeight: 500 }}>{food.calories} kcal</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Lunch;
