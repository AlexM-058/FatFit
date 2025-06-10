// CalorieBar.jsx
import React from "react";
import './CalorieBar.css';

const CalorieBar = ({ maxCalories, currentCalories, loading }) => {
  if (loading || maxCalories == null || currentCalories == null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "24px 0" }}>
        <div className="loader-animation" style={{
          width: 32,
          height: 32,
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #27ae60",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: 8
        }} />
        <div style={{ fontWeight: 500, fontSize: 15, color: "#27ae60" }}>
          Preparing your data...
        </div>
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

  // Prevent division by zero and NaN
  const safeMax = Number(maxCalories) > 0 ? Number(maxCalories) : 1;
  const safeCurrent = Number(currentCalories) >= 0 ? Number(currentCalories) : 0;
  const percentageForBar = (safeCurrent / safeMax) * 100;
  // Folosește direct percentageForBar pentru logică
  const isOverLimit = safeCurrent > safeMax;

  // Color logic
  let barColor = "#8e44ad"; // mov (purple)
  if (isOverLimit) barColor = "#e67e22"; // portocaliu (orange)
  else if (percentageForBar >= 100) barColor = "#8e44ad"; // mov la 100%

  // Dot color logic
  let dotColor = barColor;

  return (
    <div>
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "24px auto 16px auto",
      height: 18,
      position: "relative"
    }}>
      {/* Bar background */}
      <div style={{
        width: "100%",
        height: 8,
        background: "#eee",
        borderRadius: 8,
        position: "absolute",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)"
      }} />
      {/* Bar fill */}
      <div style={{
        width: `${Math.min(percentageForBar, 100)}%`,
        height: 8,
        background: barColor,
        borderRadius: 8,
        position: "absolute",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)",
        transition: "width 0.3s, background 0.3s"
      }} />
      {/* Dot */}
      <div style={{
        position: "absolute",
        left: `calc(${Math.min(percentageForBar, 100)}% - 12px)`,
        top: "50%",
        transform: "translateY(-50%)",
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: dotColor,
        border: "3px solid #fff",
        boxShadow: isOverLimit ? "0 0 8px #e67e22" : "0 0 8px #8e44ad",
        transition: "background 0.3s, left 0.3s"
      }} />
      {/* Value label above bar, show only if <= 100% */}
      {percentageForBar <= 100 && (
        <div
          style={{
            position: "absolute",
            left: `calc(${Math.min(percentageForBar, 100)}% - 24px)`,
            top: 28,
            fontWeight: "bold",
            color: isOverLimit ? "#e67e22" : "#8e44ad",
            fontSize: 14,
            minWidth: 48,
            textAlign: "center"
          }}
        >
          {safeCurrent} / {safeMax} kcal
        </div>
      )}
     
      
    </div>
    {percentageForBar > 100 && (
        <div className="calorie-bar-label">
          {safeCurrent} / {safeMax} kcal
        </div>
      )}
    </div>
  );
};

export default CalorieBar;