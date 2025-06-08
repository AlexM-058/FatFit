import React, { useState } from "react";
import CalorieBar from "../FatFit-Main/CalorieBar";
import RecipeItem from "./RecipeItem";
import "./RecipesPage.css";
const API_URL = import.meta.env.VITE_API_URL;

// Add a simple FoodItem component for food search results
const FoodItem = ({ food, onAddCalories }) => {
  // Try to get calories from food.nf_calories or food.calories or 0
  const calories =
    (food.serving_sizes && food.serving_sizes[0]?.calories) ||
    food.nf_calories ||
    food.calories ||
    0;
  return (
    <div
      className="recipe-item-card"
      style={{
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {food.food_name || food.name}
      </div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
        {food.brand_name ? <span>Brand: {food.brand_name}</span> : null}
      </div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
        Calories: {calories}
      </div>
      <button
        className="add-meal-btn"
        onClick={() => onAddCalories && onAddCalories(Number(calories))}
        disabled={!calories}
        style={{ marginTop: 8 }}
      >
        Add
      </button>
    </div>
  );
};

const RecipesPage = ({ maxCalories = 2000 }) => {
  const [currentCalories, setCurrentCalories] = useState(() => {
    // Load from localStorage if available and ensure it's a valid number
    const saved = localStorage.getItem("dailyCalories");
    const lastResetDate = localStorage.getItem("lastResetDate");
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      localStorage.setItem("dailyCalories", "0");
      localStorage.setItem("lastResetDate", today);
      return 0;
    }
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFoods, setShowFoods] = useState(false);
  const [foods, setFoods] = useState([]);

  // Update localStorage and calories on change
  const handleCaloriesChange = (val) => {
    setCurrentCalories(val);
    localStorage.setItem("dailyCalories", val.toString());
    localStorage.setItem("lastResetDate", new Date().toDateString());
  };

  const handleAddCalories = (amount) => {
    if (amount === 0) {
      handleCaloriesChange(0);
    } else {
      handleCaloriesChange(currentCalories + amount);
    }
  };

  // Search recipes
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecipes([]);
    try {
      const res = await fetch(
        `${API_URL}/recipes/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Search foods
  const handleFoodSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFoods([]);
    setShowFoods(true);
    try {
      const res = await fetch(
        `${API_URL}/fatsecret-search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch foods");
      const data = await res.json();
      setFoods(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipes-page-container">
      <CalorieBar
        maxCalories={maxCalories}
        currentCalories={currentCalories}
        onAddCalories={handleAddCalories}
        onCaloriesChange={handleCaloriesChange}
      />
      <form
        onSubmit={showFoods ? handleFoodSearch : handleSearch}
        className="recipes-search-form"
      >
        <input
          type="text"
          placeholder={
            showFoods ? "Search for foods..." : "Search for recipes..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">
          {showFoods ? "Search Foods" : "Search Recipes"}
        </button>
        <button
          type="button"
          style={{ marginLeft: 8 }}
          onClick={() => {
            setShowFoods((prev) => !prev);
            setRecipes([]);
            setFoods([]);
            setError("");
          }}
        >
          {showFoods ? "Switch to Recipes" : "Switch to Foods"}
        </button>
      </form>
      {loading && <div>Loading {showFoods ? "foods" : "recipes"}...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div className="recipes-grid">
        {showFoods
          ? foods.map((food, idx) => (
              <FoodItem
                key={food.food_id || food.id || idx}
                food={food}
                onAddCalories={handleAddCalories}
              />
            ))
          : recipes.map((recipe) => (
              <RecipeItem
                key={recipe.recipe_id || recipe.id || recipe._id}
                recipe={recipe}
                onAddCalories={handleAddCalories}
              />
            ))}
      </div>
    </div>
  );
};

export default RecipesPage;
