import React, { useEffect, useState } from "react";
import "./breakfest.css";
import { httpRequest } from "../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

function Dinner({ username, onFoodChange, refreshKey }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManage, setShowManage] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    httpRequest(`${API_URL}/caloriecounter/${username}/dinner`, {
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch dinner foods.");
        const data = await res.json();
        setFoods(data.foods || []);
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [username, refreshKey]);

  const handleDelete = async (foodName) => {
    if (!window.confirm(`Are you sure you want to delete '${foodName}' from dinner?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await httpRequest(`${API_URL}/food/${username}/dinner`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete food.");
      setFoods((prev) => prev.filter((f) => f.name !== foodName));
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
      <div className="meal-box-topline dinner-gradient" />
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
          Dinner Foods
        </span>
      </h4>
      {expanded && (
        <div className="meal-box-expanded">
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "32px 0" }}>
              <div className="loader-animation" style={{
                width: 48,
                height: 48,
                border: "6px solid #f3f3f3",
                borderTop: "6px solid #e67e22",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: 16
              }} />
              <div style={{ fontWeight: 500, fontSize: 18, color: "#e67e22" }}>
                Preparing your data...
              </div>
            </div>
          )}
          {!loading && error && <div style={{ color: "red" }}>{error}</div>}
          {!loading && foods.length === 0 && !error && <div>No dinner foods for today.</div>}
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
              🍽️ Manage Dinner
            </button>
          </div>
        </div>
      )}
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
            <h3>Manage Dinner Foods</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {foods.length === 0 && <li>No dinner foods to manage.</li>}
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
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </div>
  );
}

export default Dinner;
