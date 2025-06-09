import React, { useState } from "react";
import { useParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL
import '../blocks/PopUpFood.css'; // Ensure this file exists and contains the necessary styles
const FoodBlock = ({ food, onAddCalories, onClose, username: propUsername }) => {
  // Extract username from props or from URL params
  const params = useParams();
  const username = propUsername || params.username;

  const [grams, setGrams] = useState(100);
  const [mealType, setMealType] = useState("lunch");

  const caloriesPer100g = Number(food.food_kcal) || 0;
  const proteinPer100g = Number(food.food_protein) || 0;
  const carbsPer100g = Number(food.food_carbs) || 0;
  const fatPer100g = Number(food.food_fat) || 0;

  const calories = Math.round((caloriesPer100g * grams) / 100);
  const protein = ((proteinPer100g * grams) / 100).toFixed(2);
  const carbs = ((carbsPer100g * grams) / 100).toFixed(2);
  const fat = ((fatPer100g * grams) / 100).toFixed(2);

  const handleAddCalories = async () => {
    if (!username) {
      console.warn("Username missing. Cannot send data.");
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
      console.log("Sending to database:", payload);

      const response = await fetch(`${API_URL}/api/calories/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Sent to database for user "${username}" successfully.`);
        if (onAddCalories) onAddCalories(calories);
      } else {
        console.error(`❌ Failed to send to database:`, result.message || "Unknown error");
      }
    } catch (error) {
      console.error("❌ Could not send to database due to network/server error:", error.message);
    }
  };

  return (
    <div className="food-block-overlay" style={{
      position: "fixed",
      zIndex: 9998,
      left: 0,
      top: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(6px)"
    }}>
      <div className="food-block-extended" style={{
        position: "absolute",
        zIndex: 9999,
        background: "aliceblue",
        borderRadius: 12,
        padding: "24px 32px 32px 32px",
        minWidth: 320,
        minHeight: 180,
        boxShadow: "0 4px 24px #0002",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)"
      }}>
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
              onChange={e => setGrams(Number(e.target.value))}
              style={{ width: 70, marginLeft: 8 }}
            /> g
          </label>
          <div style={{ marginTop: 6 }}>
            <b>Total for {grams}g:</b>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Calories: {calories} kcal</li>
              <li>Protein: {protein} g</li>
              <li>Carbs: {carbs} g</li>
              <li>Fat: {fat} g</li>
            </ul>
          </div>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>
            <b>Meal Type:</b>{" "}
            <select value={mealType} onChange={e => setMealType(e.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
            </select>
          </label>
        </div>
        <p><b>Protein:</b> {food.food_protein} g / 100g</p>
        <p><b>Carbs:</b> {food.food_carbs} g / 100g</p>
        <p><b>Fat:</b> {food.food_fat} g / 100g</p>
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
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={handleAddCalories}>Add Calories</button>
          <button onClick={onClose}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default FoodBlock;
