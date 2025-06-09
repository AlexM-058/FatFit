// CalorieBar.jsx
import React, { useEffect, useState } from "react";
import './CalorieBar.css';

const CalorieBar = ({ maxCalories, username }) => {
  const [currentCalories, setCurrentCalories] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch calories from backend on mount and when username changes
  useEffect(() => {
    if (!username) return;
    async function fetchCalories() {
      try {
        // Fetch for lunch
        const resLunch = await fetch(`${API_URL}/caloriecounter/${username}/lunch`, {
          method: "GET",
          credentials: "include"
        });
        const dataLunch = await resLunch.json();
        const caloriesLunch = Array.isArray(dataLunch.foods)
          ? dataLunch.foods.map(food => food.calories)
          : [];

        // Fetch for breakfast
        const resBreakfast = await fetch(`${API_URL}/caloriecounter/${username}/breakfast`, {
          method: "GET",
          credentials: "include"
        });
        const dataBreakfast = await resBreakfast.json();
        const caloriesBreakfast = Array.isArray(dataBreakfast.foods)
          ? dataBreakfast.foods.map(food => food.calories)
          : [];

        // Fetch for dinner
        const resDinner = await fetch(`${API_URL}/caloriecounter/${username}/dinner`, {
          method: "GET",
          credentials: "include"
        });
        const dataDinner = await resDinner.json();
        const caloriesDinner = Array.isArray(dataDinner.foods)
          ? dataDinner.foods.map(food => food.calories)
          : [];

        // Fetch for snacks
        const resSnacks = await fetch(`${API_URL}/caloriecounter/${username}/snacks`, {
          method: "GET",
          credentials: "include"
        });
        const dataSnacks = await resSnacks.json();
        const caloriesSnacks = Array.isArray(dataSnacks.foods)
          ? dataSnacks.foods.map(food => food.calories)
          : [];

        // Combine all calories arrays and sum
        const allCalories = [
          ...caloriesLunch,
          ...caloriesBreakfast,
          ...caloriesDinner,
          ...caloriesSnacks
        ];
        const sum = allCalories.reduce((acc, val) => acc + (Number(val) || 0), 0);
        setCurrentCalories(sum);
      } catch (err) {
        console.error("Error fetching calories:", err);
        setCurrentCalories(0);
      }
    }
    fetchCalories();
  }, [username, API_URL]);

  // Prevent division by zero and NaN
  const safeMax = Number(maxCalories) > 0 ? Number(maxCalories) : 1;
  const safeCurrent = Number(currentCalories) >= 0 ? Number(currentCalories) : 0;
  const percentageForBar = (safeCurrent / safeMax) * 100;
  const displayProgressBarPercentage = Math.min(100, Math.max(0, percentageForBar));
  const displayPercent = isNaN(percentageForBar)
    ? "0%"
    : percentageForBar > 100
      ? "100%>"
      : `${Math.round(percentageForBar)}%`;
  const isOverLimit = safeCurrent > safeMax;

  return (
    <div className="calorie-bar-container calorie-bar-row">
      <div className={`progress-bar${isOverLimit ? " over-limit" : ""}`}>
        <div
          className={`progress-fill${isOverLimit ? " over-limit" : ""}`}
          style={{
            width: `${displayProgressBarPercentage}%`
          }}
        />
        {/* Healthy food image centered on the plate */}
        <img
          src="/assets/healthy-food.png"
          className="plate-food-img"
          alt="Healthy food"
        />
      </div>
      <div className="calorie-controls">
        <p className={isOverLimit ? "over-limit" : ""}>
          Current calories: {safeCurrent} / {safeMax}
        </p>
        <div className="calorie-bar-percent">
          {displayPercent}
        </div>
      </div>
    </div>
  );
};

export default CalorieBar;