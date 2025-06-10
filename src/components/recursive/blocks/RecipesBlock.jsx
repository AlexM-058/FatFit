import React, { useState } from "react";
import "./RecipesBlock.css";

const RecipesBlock = ({ recipes, selectedType, onRecipeOpen }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  if (!Array.isArray(recipes) || recipes.length === 0) {
    return <div>No recipes found.</div>;
  }

  let filteredRecipes = recipes;
  if (selectedType) {
    filteredRecipes = recipes.filter(
      (recipe) =>
        Array.isArray(recipe.recipe_types?.recipe_type) &&
        recipe.recipe_types.recipe_type.includes(selectedType)
    );
  }

  if (filteredRecipes.length === 0) {
    return <div>No recipes found for this type.</div>;
  }

  if (selectedRecipe) {
    if (onRecipeOpen) onRecipeOpen(true);
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="recipe-block open">
          <button
            className="back-to-list-btn"
            onClick={() => {
              setSelectedRecipe(null);
              if (onRecipeOpen) onRecipeOpen(false);
            }}
          >
            ← Back to list
          </button>
          <img
            src={selectedRecipe.recipe_image}
            alt={selectedRecipe.recipe_name}
            className="recipe-block-image"
          />
          <strong className="recipe-block-title">
            {selectedRecipe.recipe_name}
          </strong>
          <div className="recipe-block-desc">
            {selectedRecipe.recipe_description}
          </div>
          <div className="recipe-block-calories">
            Calories: {selectedRecipe.recipe_nutrition?.calories}
            {selectedRecipe.recipe_nutrition?.calories_per_100g}
               /100g
          </div>
          <div className="recipe-block-ingredients">
            <strong>Ingredients:</strong>
            <ul>
              {Array.isArray(selectedRecipe.recipe_ingredients?.ingredient)
                ? selectedRecipe.recipe_ingredients.ingredient.map((ing, idx) => <li key={idx}>{ing}</li>)
                : null}
            </ul>
          </div>
          <div className="recipe-block-nutrition">
            <strong>Nutrition:</strong>
            <ul>
              <li>Carbs: {selectedRecipe.recipe_nutrition?.carbohydrate}g</li>
              <li>Fat: {selectedRecipe.recipe_nutrition?.fat}g</li>
              <li>Protein: {selectedRecipe.recipe_nutrition?.protein}g</li>
            </ul>
          </div>
          <div className="recipe-block-types">
            <strong>Types:</strong>
            <ul>
              {Array.isArray(selectedRecipe.recipe_types?.recipe_type)
                ? selectedRecipe.recipe_types.recipe_type.map((type, idx) => <li key={idx}>{type}</li>)
                : null}
            </ul>
          </div>
        </div>
      </div>
    );
  } else {
    if (onRecipeOpen) onRecipeOpen(false);
  }

  return (
    <div className="recipes-block-container">
      <div className="recipes-list-scroll">
        {filteredRecipes.map((recipe) => (
          <div
            className="recipe-block"
            key={recipe.recipe_id || recipe.id || recipe._id}
            onClick={() => setSelectedRecipe(recipe)}
          >
            <img
              src={recipe.recipe_image}
              alt={recipe.recipe_name}
              className="recipe-block-image"
            />
            <strong className="recipe-block-title">
              {recipe.recipe_name}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipesBlock;
