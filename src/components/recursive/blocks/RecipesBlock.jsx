import React, { useState } from "react";
import "./RecipesBlock.css";

const RecipesBlock = ({ recipes, selectedType}) => {
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
    return (
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <button onClick={() => setSelectedRecipe(null)} style={{ marginBottom: 16 }}>
          Back to list
        </button>
        <div className="recipe-block" style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          padding: 16,
          background: "#fff",
          boxShadow: "0 2px 8px #0001",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <img
            src={selectedRecipe.recipe_image}
            alt={selectedRecipe.recipe_name}
            style={{
              width: 220,
              height: 160,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 10,
              background: "#eee"
            }}
          />
          <strong style={{ fontSize: 22, marginBottom: 8, textAlign: "center" }}>
            {selectedRecipe.recipe_name}
          </strong>
          <div style={{ fontSize: 15, color: "#666", textAlign: "center", marginBottom: 10 }}>
            {selectedRecipe.recipe_description}
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Ingredients:</strong>
            <ul>
              {Array.isArray(selectedRecipe.recipe_ingredients?.ingredient)
                ? selectedRecipe.recipe_ingredients.ingredient.map((ing, idx) => <li key={idx}>{ing}</li>)
                : null}
            </ul>
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Nutrition:</strong>
            <ul>
              <li>Calories: {selectedRecipe.recipe_nutrition?.calories}</li>
              <li>Carbs: {selectedRecipe.recipe_nutrition?.carbohydrate}g</li>
              <li>Fat: {selectedRecipe.recipe_nutrition?.fat}g</li>
              <li>Protein: {selectedRecipe.recipe_nutrition?.protein}g</li>
            </ul>
          </div>
          <div>
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
  }

  return (
    <div>
      <div className="recipes-block" style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {filteredRecipes.map((recipe) => (
          <div
            className="recipe-block"
            key={recipe.recipe_id || recipe.id || recipe._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 16,
              width: 260,
              background: "#fff",
              boxShadow: "0 2px 8px #0001",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer"
            }}
            onClick={() => setSelectedRecipe(recipe)}
          >
            <img
              src={recipe.recipe_image}
              alt={recipe.recipe_name}
              style={{
                width: 180,
                height: 140,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 10,
                background: "#eee"
              }}
            />
            <strong style={{ fontSize: 18, marginBottom: 6, textAlign: "center" }}>
              {recipe.recipe_name}
            </strong>
            <div style={{ fontSize: 13, color: "#666", textAlign: "center" }}>
              {recipe.recipe_description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipesBlock;
