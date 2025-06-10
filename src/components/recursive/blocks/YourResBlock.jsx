import React, { useState } from "react";
import "./YourResBlock.css";
import { httpRequest } from "../../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

function YourResBlock({ recipe, username, mealType, onAddCalories }) {
  const [status, setStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [servings, setServings] = useState(1);
  const [expanded, setExpanded] = useState(false);

  // Detect mobile using a media query (SSR safe)
  const isMobile = typeof window !== "undefined"
    ? window.matchMedia("(max-width: 650px)").matches
    : false;

  const handleAddClick = () => {
    setShowPopup(true);
    setStatus("");
    setServings(1);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setStatus("");
  };

  const handleAddRecipe = async () => {
    if (!username) {
      setStatus("Username missing. Cannot send data.");
      return;
    }
    const foodData = {
      name: recipe.name,
      calories: parseFloat(recipe.calories) * servings,
    };
    const payload = {
      mealType,
      foods: [foodData],
    };
    try {
      const response = await httpRequest(`${API_URL}/api/recipes-calories/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok && result.success) {
        if (onAddCalories) onAddCalories(foodData.calories);
        setStatus("✅ Recipe added successfully!");
        setTimeout(() => {
          setShowPopup(false);
        }, 1200);
      } else {
        setStatus(`❌ Failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      setStatus("❌ Network/server error: " + error.message);
    }
  };

  // Safe fallback for mealType
  const safeMealType = mealType || "meal";

  return (
    <div className="your-res-block same-size-block">
      {isMobile ? (
        <>
          <div
            className="your-res-collapsed"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => setExpanded((v) => !v)}
            tabIndex={0}
            role="button"
            aria-expanded={expanded}
          >
            <span
              className="your-res-arrow"
              style={{
                display: "inline-block",
                transition: "transform 0.2s",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                fontSize: 22,
                marginRight: 6,
                color: "#7c3aed"
              }}
            >
              ▶
            </span>
            <strong>{recipe.name}</strong>
          </div>
          {expanded && (
            <div className="your-res-expanded">
              <p>Calories: {recipe.calories} kcal</p>
              {Array.isArray(recipe.ingredients) && (
                <div>
                  <b>Ingredients:</b>
                  <ul>
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.ingredient}
                        {ing.quantity && <> - {multiplyQuantity(ing.quantity, servings)}</>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recipe.recipe && (
                <div>
                  <b>How to cook:</b>
                  <div>{recipe.recipe}</div>
                </div>
              )}
              <div className="your-res-add-btn-row">
                <button className="add-meal-btn" onClick={handleAddClick}>
                  Add to {safeMealType.charAt(0).toUpperCase() + safeMealType.slice(1)}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <strong>{recipe.name}</strong>
          <p>Calories: {recipe.calories} kcal</p>
          {Array.isArray(recipe.ingredients) && (
            <div>
              <b>Ingredients:</b>
              <ul>
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>
                    {ing.ingredient}
                    {ing.quantity && <> - {multiplyQuantity(ing.quantity, servings)}</>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recipe.recipe && (
            <div>
              <b>How to cook:</b>
              <div>{recipe.recipe}</div>
            </div>
          )}
          <div className="your-res-add-btn-row">
            <button className="add-meal-btn" onClick={handleAddClick}>
              Add to {safeMealType.charAt(0).toUpperCase() + safeMealType.slice(1)}
            </button>
          </div>
        </>
      )}
      {showPopup && (
        <div className="your-res-popup-overlay">
          <div className="your-res-popup">
            <h3>{recipe.name}</h3>
            <ul>
              <li>
                <b>Calories:</b> {recipe.calories} kcal / serving
                <div style={{ marginTop: 8 }}>
                  <label>
                    <b>Servings:</b>{" "}
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={servings}
                      onChange={e => setServings(Number(e.target.value))}
                      style={{ width: 50, marginLeft: 8 }}
                    />
                  </label>
                  <div style={{ marginTop: 4 }}>
                    <b>Total Calories:</b> {parseFloat(recipe.calories) * servings} kcal
                  </div>
                </div>
              </li>
              {Array.isArray(recipe.ingredients) && (
                <li>
                  <b>Ingredients:</b>
                  <ul>
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.ingredient}
                        {ing.quantity && <> - {multiplyQuantity(ing.quantity, servings)}</>}
                        {ing.calories !== undefined && <> - {multiplyNumber(ing.calories, servings)} kcal</>}
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              {recipe.recipe && (
                <li>
                  <b>How to cook:</b>
                  <div>{recipe.recipe}</div>
                </li>
              )}
            </ul>
            <div className="your-res-popup-btn-row">
              <button onClick={handleAddRecipe}>
                Confirm Add to {safeMealType.charAt(0).toUpperCase() + safeMealType.slice(1)}
              </button>
              <button className="your-res-popup_back-btn" onClick={handleClosePopup}>Back</button>
            </div>
            {status && <div className="your-res-status">{status}</div>}
          </div>
        </div>
      )}
    </div>
  );

  function multiplyQuantity(quantity, servings) {
    const match = /^(\d+(?:\.\d+)?)([a-zA-Z]*)$/.exec(quantity.trim());
    if (!match) return quantity;
    const value = parseFloat(match[1]);
    const unit = match[2];
    return `${value * servings}${unit}`;
  }

  function multiplyNumber(val, servings) {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num * servings;
  }
}

export default YourResBlock;
