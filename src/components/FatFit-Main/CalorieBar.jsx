// CalorieBar.jsx
import React from "react";
import './CalorieBar.css';

const CalorieBar = ({ maxCalories, currentCalories }) => {
  // Prevent division by zero and NaN
  const safeMax = Number(maxCalories) > 0 ? Number(maxCalories) : 1;
  const safeCurrent = Number(currentCalories) >= 0 ? Number(currentCalories) : 0;
  const percentageForBar = (safeCurrent / safeMax) * 100;
  const displayProgressBarPercentage = Math.min(100, Math.max(0, percentageForBar));
  const isOverLimit = safeCurrent > safeMax;

  // Color logic
  let barColor = "#8e44ad"; // purple
  if (isOverLimit) barColor = "#e74c3c"; // red
  else if (displayProgressBarPercentage >= 100) barColor = "#27ae60"; // green

  // Dot color logic
  let dotColor = barColor;

  return (
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
        width: `${displayProgressBarPercentage}%`,
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
        left: `calc(${displayProgressBarPercentage}% - 12px)`,
        top: "50%",
        transform: "translateY(-50%)",
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: dotColor,
        border: "3px solid #fff",
        boxShadow: isOverLimit ? "0 0 8px #e74c3c" : "0 0 8px #aaa",
        transition: "background 0.3s, left 0.3s"
      }} />
      {/* Value label */}
      <div style={{
        position: "absolute",
        left: `calc(${displayProgressBarPercentage}% - 24px)`,
        top: 28,
        fontWeight: "bold",
        color: isOverLimit ? "#e74c3c" : "#333",
        fontSize: 14,
        minWidth: 48,
        textAlign: "center"
      }}>
        {safeCurrent} / {safeMax} kcal
      </div>
    </div>
  );
};

export default CalorieBar;