import React, { useEffect, useState } from "react";
import "./breakfest.css"; // reuse the same CSS for consistent design
const API_URL = import.meta.env.VITE_API_URL;

function Snacks({ username, onFoodChange }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManage, setShowManage] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/caloriecounter/${username}/snacks`, {
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch snacks.");
        const data = await res.json();
        setFoods(data.foods || []);
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [username]);

  const handleDelete = async (foodName) => {
    if (!window.confirm(`Are you sure you want to delete '${foodName}' from snacks?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/food/${username}/snacks`, {
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
        setTimeout(() => onFoodChange(), 100); // slight delay to ensure backend update
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meal-box">
      <div className="meal-box-topline snacks-gradient" />
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
          Snacks
        </span>
      </h4>
      {expanded && (
        <div className="meal-box-expanded">
          {loading && <div>Loading snacks...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {foods.length === 0 && !loading && <div>No snacks for today.</div>}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {foods.map((food, idx) => (
              <li key={idx} className="meal-food-row">
                <span>{food.name} {food.calories ? `(${food.calories} kcal)` : ""}</span>
              </li>
            ))}
          </ul>
          <div className="meal-manage-btn-row">
            <button
              className="meal-manage-btn"
              onClick={() => setShowManage(true)}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              🍪 Manage Snacks
            </button>
          </div>
        </div>
      )}
      {/* Manage Popup */}
      {showManage && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowManage(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 320,
              minHeight: 180,
              boxShadow: "0 4px 24px #0002",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3>Manage Snacks</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {foods.length === 0 && <li>No snacks to manage.</li>}
              {foods.map((food, idx) => (
                <li key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <span>{food.name} {food.calories ? `(${food.calories} kcal)` : ""}</span>
                  <button
                    style={{
                      marginLeft: 12,
                      color: "white",
                      background: "#e74c3c",
                      border: "none",
                      borderRadius: 4,
                      padding: "2px 8px",
                      cursor: "pointer"
                    }}
                    onClick={() => handleDelete(food.name)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <button
              style={{
                marginTop: 16,
                background: "#888",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "6px 18px",
                cursor: "pointer"
              }}
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

export default Snacks;
