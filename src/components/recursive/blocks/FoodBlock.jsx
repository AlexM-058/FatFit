import React, { useState } from "react";
import './FoodBlock.css'; // Ensure this path is correct
import PopupFood from "./PopUpFood";// Make sure this file exists

function FoodBlock({ food, calories , username }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleAddClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="food-block">
      <strong>{food.food_name}</strong>
      <p>Calories: {food.food_kcal}kcal/100g</p>
      <p>Protein: {food.food_protein}g/100g</p>
      <p>Carbs: {food.food_carbs}g/100g</p>
      <p>Fat: {food.food_fat}g/100g</p>
      <button
        className="add-meal-btn"
        onClick={handleAddClick}
       
        style={{ marginTop: 8 }}
      >
        Add
      </button>
      {showPopup && (
        <PopupFood food={food} calories={calories} onClose={handleClosePopup} username={username} />
      )}
      {/* Poți adăuga aici mai multe detalii despre food dacă vrei */}
    </div>
  );
}

export default FoodBlock;
