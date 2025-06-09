import React, { useState, useEffect } from "react";
import YourResBlock from "./blocks/YourResBlock.jsx";
import "./ForYouRecipes.css";

const ForYouRecipes = ({ username }) => {
  const [breakfastRecipes, setBreakfastRecipes] = useState([]);
  const [lunchRecipes, setLunchRecipes] = useState([]);
  const [dinnerRecipes, setDinnerRecipes] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load and split recipes from localStorage or fetch from backend
  useEffect(() => {
    if (!username) {
      setBreakfastRecipes([]);
      setLunchRecipes([]);
      setDinnerRecipes([]);
      setError("No username provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const localKey = `ai_recipes_${username}`;
    const cached = localStorage.getItem(localKey);
    const processData = (meal_plan) => {
      setBreakfastRecipes(
        Array.isArray(meal_plan.breakfast) ? meal_plan.breakfast : []
      );
      setLunchRecipes(Array.isArray(meal_plan.lunch) ? meal_plan.lunch : []);
      setDinnerRecipes(Array.isArray(meal_plan.dinner) ? meal_plan.dinner : []);
    };
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.breakfast || parsed.lunch || parsed.dinner) {
          processData(parsed);
          setLoading(false);
          setError(null);
          return;
        }
      } catch (err) {
        console.warn("Invalid cached AI recipes format:", err);
        // ignore parse error, fallback to fetch
      }
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/fitness-tribe/recipes/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error generating AI recipes");
        const data = await res.json();
        if (data.meal_plan) {
          processData(data.meal_plan);
          localStorage.setItem(localKey, JSON.stringify(data.meal_plan));
        } else {
          setBreakfastRecipes([]);
          setLunchRecipes([]);
          setDinnerRecipes([]);
        }
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [username]);

  let recipesToShow = [];
  let mealTitle = "";
  if (selectedMeal === "breakfast") {
    recipesToShow = breakfastRecipes;
    mealTitle = "Breakfast";
  } else if (selectedMeal === "lunch") {
    recipesToShow = lunchRecipes;
    mealTitle = "Lunch";
  } else if (selectedMeal === "dinner") {
    recipesToShow = dinnerRecipes;
    mealTitle = "Dinner";
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", margin: 32 }}>
        Loading AI recipes...
      </div>
    );
  }

  if (error) {
    return <div style={{ color: "red", margin: 16 }}>{error}</div>;
  }

  return (
    <div className="recipes-main-container">
      <h2 className="recipes-title">For You - AI Recipes</h2>
      <div className="recipes-meal-tabs">
        <button
          className={`recipes-tab-btn${
            selectedMeal === "breakfast" ? " active" : ""
          }`}
          onClick={() => setSelectedMeal("breakfast")}
        >
          Breakfast
        </button>
        <button
          className={`recipes-tab-btn${
            selectedMeal === "lunch" ? " active" : ""
          }`}
          onClick={() => setSelectedMeal("lunch")}
        >
          Lunch
        </button>
        <button
          className={`recipes-tab-btn${
            selectedMeal === "dinner" ? " active" : ""
          }`}
          onClick={() => setSelectedMeal("dinner")}
        >
          Dinner
        </button>
      </div>
      <h3 className="recipes-meal-title">{mealTitle}</h3>
      <div className="recipes-list-scroll">
        {recipesToShow.length === 0 ? (
          <div className="recipes-empty">
            No {mealTitle.toLowerCase()} recipes.
          </div>
        ) : (
          recipesToShow.map((recipe, idx) => (
            <YourResBlock
              key={idx}
              recipe={{
                name: recipe.description || recipe.name || `Recipe ${idx + 1}`,
                calories: recipe.total_calories || recipe.calories || 0,
                ingredients: recipe.ingredients,
                recipe: recipe.recipe,
              }}
              username={username}
              mealType={mealTitle.toLowerCase()}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ForYouRecipes;
