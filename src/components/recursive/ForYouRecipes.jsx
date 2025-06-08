import React, { useState, useEffect } from "react";
import YourResBlock from "./blocks/YourResBlock.jsx";
const API_URL = import.meta.env.VITE_API_URL;

const ForYouRecipes = ({ username }) => {
  const [breakfastRecipes, setBreakfastRecipes] = useState([]);
  const [lunchRecipes, setLunchRecipes] = useState([]);
  const [dinnerRecipes, setDinnerRecipes] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load and split recipes from localStorage or fetch from backend
  useEffect(() => {
    if (!username) return;
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
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/fitness-tribe/recipes/${username}`, {
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
      <h2 style={{ textAlign: "center" }}>For You - AI Recipes</h2>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <button
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border:
              selectedMeal === "breakfast"
                ? "2px solid #4caf50"
                : "1px solid #888",
            background:
              selectedMeal === "breakfast" ? "#eaffea" : "#f5f5f5",
            cursor: "pointer",
            fontWeight:
              selectedMeal === "breakfast" ? "bold" : "normal",
          }}
          onClick={() => setSelectedMeal("breakfast")}
        >
          Breakfast
        </button>
        <button
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border:
              selectedMeal === "lunch"
                ? "2px solid #4caf50"
                : "1px solid #888",
            background: selectedMeal === "lunch" ? "#eaffea" : "#f5f5f5",
            cursor: "pointer",
            fontWeight: selectedMeal === "lunch" ? "bold" : "normal",
          }}
          onClick={() => setSelectedMeal("lunch")}
        >
          Lunch
        </button>
        <button
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border:
              selectedMeal === "dinner"
                ? "2px solid #4caf50"
                : "1px solid #888",
            background: selectedMeal === "dinner" ? "#eaffea" : "#f5f5f5",
            cursor: "pointer",
            fontWeight: selectedMeal === "dinner" ? "bold" : "normal",
          }}
          onClick={() => setSelectedMeal("dinner")}
        >
          Dinner
        </button>
      </div>
      <h3 style={{ textAlign: "center" }}>{mealTitle}</h3>
      {/* Compartment pentru breakfast: listă cu nume și calorii */}
      {selectedMeal === "breakfast" && (
        <div
          style={{
            margin: "0 auto 24px auto",
            maxWidth: 400,
            background: "#f9f9f9",
            borderRadius: 10,
            padding: 16,
            boxShadow: "0 2px 8px #0001",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0", textAlign: "center" }}>
            Breakfast Items
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {breakfastRecipes.map((rec, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  padding: "6px 0",
                }}
              >
                <span>{rec.description || rec.name || `Recipe ${idx + 1}`}</span>
                <span style={{ fontWeight: 500 }}>
                  {rec.total_calories || rec.calories || 0} kcal
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {recipesToShow.length === 0 ? (
          <div>No {mealTitle.toLowerCase()} recipes.</div>
        ) : (
          recipesToShow.map((recipe, idx) => (
            <YourResBlock
              key={idx}
              recipe={{
                name: recipe.description || recipe.name || `Recipe ${idx + 1}`,
                calories: recipe.total_calories || recipe.calories || 0,
                ingredients: recipe.ingredients,
                recipe: recipe.recipe
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
