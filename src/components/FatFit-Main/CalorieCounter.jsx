// CalorieCounter.jsx
import React, { useEffect, useState, useCallback } from 'react';
import CalorieBar from './CalorieBar';
import Breakfest from './breakfest';
import Lunch from './lunch';
import Dinner from './dinner';
import Snacks from './Snacks';
import './CalorieCounter.css';
import { httpRequest } from '../../utils/http';

const API_URL = import.meta.env.VITE_API_URL;

function CalorieCounter({ username }) {
  const [maxCalories, setMaxCalories] = useState(null);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user calorie target only
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    httpRequest(`${API_URL}/fatfit/${username}`, {
      method: "GET",
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || "Error loading user data.");
        }
        const data = await res.json();
        if (data && data.data === 'Protected content') {
          throw new Error("Session expired or unauthorized. Please log in again.");
        }
        setMaxCalories(data.dailyCalorieTarget);
      })
      .catch(err => setError(err.message || "Failed to load user data."))
      .finally(() => setLoading(false));
  }, [username]);

  // Callback to trigger refresh from children
  const handleFoodChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch total calories from all meals
  useEffect(() => {
    if (!username) return;
    let isMounted = true;
    const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
    Promise.all(
      mealTypes.map(mealType =>
        httpRequest(`${API_URL}/caloriecounter/${username}/${mealType}`, {
          method: "GET",
          credentials: "include"
        })
          .then(async res => {
            let mealData = {};
            try { mealData = await res.json(); } catch { mealData = {}; }
            return Array.isArray(mealData.foods)
              ? mealData.foods.filter(f => typeof f.calories !== "undefined")
              : [];
          })
          .catch(() => [])
      )
    ).then(results => {
      if (!isMounted) return;
      const allFoods = results.flat();
      const total = allFoods.reduce((acc, food) => acc + (Number(food.calories) || 0), 0);
      setCurrentCalories(total);
    });
    return () => { isMounted = false; };
  }, [username, refreshKey]);

  if (loading) return <p>Loading user calorie data...</p>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (maxCalories === null) return <p>No daily calorie target available for this user.</p>;

  return (
    <div className="calorie-counter-container" style={{ overflowY: "auto", maxHeight: "80vh" }}>
      <div className="calorie-counter-header pretty-header">
        <div className="header-bg-deco"></div>
        <h2 className="header-title">Calorie Monitoring</h2>
        <p className="header-target">
          Daily target: <strong>{maxCalories} kcal</strong>
        </p>
        <div className="header-bar-wrap">
          <CalorieBar maxCalories={maxCalories} currentCalories={currentCalories} />
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