// CalorieCounter.jsx
import React, { useEffect, useState, useCallback } from 'react';
import CalorieBar from './CalorieBar';
import Breakfest from './breakfest';
import Lunch from './lunch';
import Dinner from './dinner';
import Snacks from './Snacks';
import './CalorieCounter.css';

function CalorieCounter({ username }) {
  const [currentCalories, setCurrentCalories] = useState(0);
  const [maxCalories, setMaxCalories] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [errorInitialData, setErrorInitialData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user data and calories
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchUserDataAndDailyTarget() {
      try {
        setLoadingInitialData(true);
        setErrorInitialData(null);

        if (typeof username !== 'string' || !username) {
          setErrorInitialData("Username not available. Please log in.");
          setLoadingInitialData(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/fatfit/${username}`, {
          signal,
          credentials: "include"
        });

        if (signal.aborted) return;

        if (response.status === 401) {
          setErrorInitialData("Session expired or unauthorized. Please log in again.");
          setLoadingInitialData(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          setErrorInitialData(errorData.message || "Error loading user data.");
          return;
        }
        const data = await response.json();
        if (data && data.data === 'Protected content') {
          setErrorInitialData("Session expired or unauthorized. Please log in again.");
          setLoadingInitialData(false);
          return;
        }
        setMaxCalories(data.dailyCalorieTarget);

        // --- Extract calories from all meals ---
        let totalCalories = 0;
        // Fetch all foods for each meal and sum calories
        const API_URL = import.meta.env.VITE_API_URL;
        const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
        let allFoods = [];
        for (const mealType of mealTypes) {
          try {
            const res = await fetch(`${API_URL}/caloriecounter/${username}/${mealType}`, {
              credentials: "include"
            });
            // Defensive: check for valid JSON and foods array
            let mealData = {};
            try {
              mealData = await res.json();
            } catch {
              mealData = {};
            }
            if (Array.isArray(mealData.foods)) {
              allFoods = allFoods.concat(mealData.foods.filter(f => typeof f.calories !== "undefined"));
            }
          } catch (e) {
            console.error(`Error fetching ${mealType} data:`, e);
            // Ignore errors for individual meals
          }
        }
        // Defensive: sum only numbers
        totalCalories = allFoods.reduce((acc, food) => acc + (Number(food.calories) || 0), 0);
        setCurrentCalories(totalCalories);

      } catch (err) {
        if (err.name !== 'AbortError') {
          setErrorInitialData(err.message || "Failed to load initial data.");
        }
      } finally {
        setLoadingInitialData(false);
      }
    }

    fetchUserDataAndDailyTarget();

    return () => {
      controller.abort();
    };
  }, [username, refreshKey]); // <-- refreshKey here

  // Callback to trigger refresh from children
  const handleFoodChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (loadingInitialData) return <p>Loading user calorie data...</p>;
  if (errorInitialData) return <div className="error-message">Error: {errorInitialData}</div>;
  if (maxCalories === null) return <p>No daily calorie target available for this user.</p>;

  return (
    <div className="calorie-counter-container" style={{ overflowY: "auto", maxHeight: "80vh" }}>
      <div className="calorie-counter-header pretty-header">
        <div className="header-bg-deco"></div>
        <h2 className="header-title">
          Calorie Monitoring
        </h2>
        <p className="header-target">
          Daily target: <strong>{maxCalories} kcal</strong>
        </p>
        <div className="header-bar-wrap">
          <CalorieBar
            maxCalories={maxCalories}
            currentCalories={currentCalories}
          />
        </div>
      </div>
      <div className="meal-sections">
        <h1>Meals</h1>
        <div className="meal-section meal-section-responsive">
          <Breakfest className="breakfest" username={username} onFoodChange={handleFoodChange} />
          <Lunch className="lunch" username={username} onFoodChange={handleFoodChange} />
          <Dinner className="dinner" username={username} onFoodChange={handleFoodChange} />
          <Snacks className="snacks" username={username} onFoodChange={handleFoodChange} />
        </div>
      </div>
    </div>
  );
}

export default CalorieCounter;