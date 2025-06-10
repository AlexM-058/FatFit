import React, { useState } from "react";
import './FoodBlock.css';
import PopupFood from "./PopUpFood";

function FoodBlock({ food, calories, username }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleAddClick = () => {
    setShowPopup(true);
  };

  return (
    <>
      <div className="food-block" style={showPopup ? { pointerEvents: "none", filter: "blur(2px)" } : {}}>
        <strong>{food.food_name}</strong>
        <p>Calories: {food.food_kcal}kcal/100g</p>
        <p>Protein: {food.food_protein}g/100g</p>
        <p>Carbs: {food.food_carbs}g/100g</p>
        <p>Fat: {food.food_fat}g/100g</p>
        <button
          className="add-meal-btn"
          onClick={handleAddClick}
          style={{ marginTop: 8 }}
          disabled={showPopup}
        >
          Add
        </button>
      </div>
      {showPopup && (
        <>
          <div className="food-block-blur-overlay" style={{
            position: "fixed",
            zIndex: 9998,
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(220, 210, 255, 0.18)",
            backdropFilter: "blur(4px)"
          }} />
          <div style={{ zIndex: 9999, position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PopupFood
              food={food}
              calories={calories}
              onClose={() => setShowPopup(false)}
              username={username}
            />
          </div>
        </>
      )}
    </>
  );
}

export default FoodBlock;
