import React from "react";
import "./RecipeItem.css";

const RecipeItem = ({ recipe, onAddCalories }) => {
  const serving = recipe.serving_sizes && recipe.serving_sizes[0];
  const calories = serving && serving.calories ? Number(serving.calories) : 0;
  const image = recipe.recipe_image || "/assets/placeholder-recipe.png";

  return (
    <div className="recipe-item-card">
      <img
        src={image}
        alt={recipe.recipe_name}
        className="recipe-item-img"
        onError={e => { e.target.src = "/assets/placeholder-recipe.png"; }}
      />
      <div className="recipe-item-content">
        <h4>{recipe.recipe_name}</h4>
        <div>Servings: {serving?.serving_description || "N/A"}</div>
        <div>Calories/serving: <b>{calories > 0 ? calories : "N/A"}</b></div>
        <button
          className="add-meal-btn"
          onClick={() => onAddCalories && onAddCalories(calories)}
          disabled={!calories}
        >
          Add {calories} calories
        </button>
      </div>
    </div>
  );
};

export default RecipeItem;
