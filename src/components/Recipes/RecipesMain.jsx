import React, { useEffect, useState } from "react";
import RecipesBlock from "../recursive/blocks/RecipesBlock.jsx";
import "./RecipesMain.css";
import { httpRequest } from "../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

// Refacem selecțiile la toate tipurile găsite în date, nu doar cele principale
const getAllTypes = (recipes) => {
  const typesSet = new Set();
  recipes.forEach((recipe) => {
    if (Array.isArray(recipe.recipe_types?.recipe_type)) {
      recipe.recipe_types.recipe_type.forEach((type) => {
        typesSet.add(type);
      });
    }
  });
  return Array.from(typesSet);
};

const RecipesMain = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [isRecipeOpen, setIsRecipeOpen] = useState(false); // nou

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await httpRequest(`${API_URL}/api/recipes/search`);
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  if (loading) return <div>Loading recipes...</div>;
  if (error) return <div>Error: {error}</div>;

  const allTypes = getAllTypes(recipes);

  return (
    <div className={`recipes-simple-container${isRecipeOpen ? " recipe-details-open" : ""}`}>
      <h2 className="recipes-main-title">Recipes</h2>
      {/* Ascunde filtrele dacă este deschis un food block */}
      {!isRecipeOpen && (
        <div className="recipes-type-filters">
          <button
            className={selectedType === "" ? "selected" : ""}
            onClick={() => setSelectedType("")}
          >
            All
          </button>
          {allTypes.map((type) => (
            <button
              key={type}
              className={selectedType === type ? "selected" : ""}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      <div className="recipes-count">
        <RecipesBlock
          recipes={recipes}
          selectedType={selectedType === "" ? null : selectedType}
          onRecipeOpen={setIsRecipeOpen}
        />
      </div>
    </div>
  );
};

export default RecipesMain;
