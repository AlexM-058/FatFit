import React, { useEffect, useState } from "react";
import "./breakfest.css";
import { httpRequest } from "../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

function Breakfast({ username, onFoodChange }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManage, setShowManage] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Fetch breakfast foods for today
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    httpRequest(`${API_URL}/caloriecounter/${username}/breakfast`, {
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch breakfast foods.");
        const data = await res.json();
        setFoods(data.foods || []);
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [username]);

  // Delete a food item
  const handleDelete = async (foodName) => {
    if (!window.confirm(`Are you sure you want to delete '${foodName}' from breakfast?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await httpRequest(`${API_URL}/food/${username}/breakfast`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete food.");
      setFoods((prev) => prev.filter((f) => f.name !== foodName));
      // Force refresh calorie bar by triggering parent's fetch
      if (typeof onFoodChange === "function") {
        setTimeout(() => onFoodChange(), 100);
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meal-box">
      <div className="meal-box-topline breakfast-gradient" />
      <h4 className="meal-box-title">
        <span
          className="meal-box-expand"
          onClick={() => setExpanded((v) => !v)}
        >
          <span
            className="meal-box-arrow"
            style={{
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)"
            }}
          >
            ▶
          </span>
          Breakfast Foods
        </span>
      </h4>
      {expanded && (
        <div className="meal-box-expanded">
          {loading && <div>Loading breakfast foods...</div>}
          {error && <div className="meal-error">{error}</div>}
          <ul className="meal-food-list">
            {/* Show foods if any */}
            {foods && foods.length > 0 && foods.map((food, idx) => (
              <li key={idx} className="meal-food-row">
                <span>{food.name} {food.calories ? `(${food.calories} kcal)` : ""}</span>
              </li>
            ))}
            {/* Show message only if not loading, not error, and foods is empty */}
            {!loading && !error && foods && foods.length === 0 && (
              <li className="meal-food-row meal-food-empty">
                No breakfast foods for today.
              </li>
            )}
          </ul>
          <div className="meal-manage-btn-row">
            <button
              className="meal-manage-btn"
              onClick={() => setShowManage(true)}
            >
              🍳 Manage Breakfast
            </button>
          </div>
        </div>
      )}
      {/* Manage Popup */}
      {showManage && (
        <div
          className="meal-manage-overlay"
          onClick={() => setShowManage(false)}
        >
          <div
            className="meal-manage-popup"
            onClick={e => e.stopPropagation()}
          >
            <h3>Manage Breakfast Foods</h3>
            <ul className="meal-food-list">
              {foods.length === 0 && <li>No breakfast foods to manage.</li>}
              {foods.map((food, idx) => (
                <li key={idx} className="meal-manage-row">
                  <span>{food.name} {food.calories ? `(${food.calories} kcal)` : ""}</span>
                  <button
                    className="meal-delete-btn"
                    onClick={() => handleDelete(food.name)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="meal-close-btn"
              onClick={() => setShowManage(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Breakfast;
