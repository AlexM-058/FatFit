import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { httpRequest } from "../../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;
import '../blocks/PopUpFood.css';

const PopUpFood = ({ food, onAddCalories, onClose, username: propUsername }) => {
  const params = useParams();
  const username = propUsername || params.username;

  const [grams, setGrams] = useState(100);
  const [mealType, setMealType] = useState("lunch");
  const [error, setError] = useState("");

  const caloriesPer100g = Number(food.food_kcal) || 0;
  const proteinPer100g = Number(food.food_protein) || 0;
  const carbsPer100g = Number(food.food_carbs) || 0;
  const fatPer100g = Number(food.food_fat) || 0;

  const calories = grams ? Math.round((caloriesPer100g * grams) / 100) : 0;
  const protein = grams ? ((proteinPer100g * grams) / 100).toFixed(2) : "0.00";
  const carbs = grams ? ((carbsPer100g * grams) / 100).toFixed(2) : "0.00";
  const fat = grams ? ((fatPer100g * grams) / 100).toFixed(2) : "0.00";

  const handleAddCalories = async () => {
    if (!username) {
      setError("Username missing. Cannot send data.");
      return;
    }
    if (!grams || grams <= 0) {
      setError("Please enter a valid grams amount.");
      return;
    }

    const foodData = {
      name: food.food_name,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
    };

    const payload = {
      mealType,
      foods: [foodData],
    };

    try {
      const response = await httpRequest(`${API_URL}/api/calories/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (onAddCalories) onAddCalories(calories);
        onClose();
      } else {
        setError(result.message || "Failed to send to database.");
      }
    } catch (error) {
      console.error("Error sending food data:", error);
      setError("Could not send to database due to network/server error.");
    }
  };

  const handleGramsChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && Number(val) >= 0)) {
      setGrams(val === "" ? "" : Number(val));
      setError("");
    }
  };

  return (
    <div className="food-block-popup mobile-food-block-popup">
      <h3>{food.food_name}</h3>
      <p><b>Calories:</b> {food.food_kcal} kcal / 100g</p>
      <div style={{ margin: "10px 0" }}>
        <label>
          <b>Select grams:</b>{" "}
          <input
            type="number"
            min={1}
            max={1000}
            step={1}
            value={grams}
            onChange={handleGramsChange}
            placeholder="grams"
            style={{ width: 70, marginLeft: 8 }}
          /> g
        </label>
        <div style={{ marginTop: 6 }}>
          <b>Total for {grams || 0}g:</b>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Calories: {calories} kcal</li>
            <li>Protein: {protein} g</li>
            <li>Carbs: {carbs} g</li>
            <li>Fat: {fat} g</li>
          </ul>
        </div>
      </div>
      <div className="popup-mealtype-row" style={{ margin: "14px 0 10px 0", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <label style={{ fontWeight: 600, color: "#7c3aed", marginRight: 10 }}>
          Meal Type:
        </label>
        <select
          value={mealType}
          onChange={e => setMealType(e.target.value)}
          className="popup-mealtype-select"
          style={{
            border: "1.5px solid #ffd166",
            borderRadius: 8,
            padding: "6px 18px",
            fontSize: "1em",
            background: "#f8f6fb",
            color: "#7c3aed",
            fontWeight: 600,
            outline: "none",
            transition: "border 0.2s, background 0.2s, color 0.2s"
          }}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snacks">Snacks</option>
        </select>
      </div>
      {food.brand_name && <p><b>Brand:</b> {food.brand_name}</p>}
      {food.food_description && <p><b>Description:</b> {food.food_description}</p>}
      {food.serving_sizes && Array.isArray(food.serving_sizes) && food.serving_sizes.length > 0 && (
        <div>
          <b>Serving Sizes:</b>
          <ul>
            {food.serving_sizes.map((serv, idx) => (
              <li key={idx}>
                {serv.serving_description || ""} {serv.calories ? `- ${serv.calories} kcal` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="popup-btn-row" style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button className="popup-btn" onClick={handleAddCalories}>Add Calories</button>
        <button className="popup-btn popup-btn-cancel" onClick={onClose}>Back</button>
      </div>
      {error && <div className="popup-error">{error}</div>}
    </div>
  );
};

export default PopUpFood;
