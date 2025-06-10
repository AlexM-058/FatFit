// CalorieCounter.jsx
import React, { useEffect, useState, useCallback } from 'react';
import CalorieBar from './CalorieBar';
import Breakfast from './breakfast';
import Lunch from './lunch';
import Dinner from './dinner';
import Snacks from './Snacks';
import './CalorieCounter.css';
import { httpRequest } from '../../utils/http';

const API_URL = import.meta.env.VITE_API_URL;

function CalorieCounter({ username }) {
  const [currentCalories, setCurrentCalories] = useState(0);
  const [maxCalories, setMaxCalories] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [errorInitialData, setErrorInitialData] = useState(null);

  // Separate refresh keys for each meal and calorie bar
  const [refreshBarKey, setRefreshBarKey] = useState(0);
  const [refreshBreakfast, setRefreshBreakfast] = useState(0);
  const [refreshLunch, setRefreshLunch] = useState(0);
  const [refreshDinner, setRefreshDinner] = useState(0);
  const [refreshSnacks, setRefreshSnacks] = useState(0);

  // Fetch user data and calories (for calorie bar)
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

        const response = await httpRequest(`${API_URL}/fatfit/${username}`, {
          method: "GET",
          credentials: "include",
          signal
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
        let allFoods = [];
        const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
        for (const mealType of mealTypes) {
          try {
            const res = await httpRequest(`${API_URL}/caloriecounter/${username}/${mealType}`, {
              method: "GET",
              credentials: "include"
            });
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
            // ignore
            console.warn(`Failed to fetch ${mealType} foods:`, e);
          }
        }
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
  }, [username, refreshBarKey]);

  // Adaugă refreshKey ca prop pentru fiecare masă și folosește funcții dedicate pentru refresh
  const handleBreakfastChange = useCallback(() => {
    setRefreshBarKey(k => k + 1);
    setRefreshBreakfast(k => k + 1);
  }, []);
  const handleLunchChange = useCallback(() => {
    setRefreshBarKey(k => k + 1);
    setRefreshLunch(k => k + 1);
  }, []);
  const handleDinnerChange = useCallback(() => {
    setRefreshBarKey(k => k + 1);
    setRefreshDinner(k => k + 1);
  }, []);
  const handleSnacksChange = useCallback(() => {
    setRefreshBarKey(k => k + 1);
    setRefreshSnacks(k => k + 1);
  }, []);

  if (loadingInitialData) {
    return <div>Loading...</div>;
  }

  if (errorInitialData) {
    return <div className="error">{errorInitialData}</div>;
  }

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
          <Breakfast
            className="breakfast"
            username={username}
            onFoodChange={handleBreakfastChange}
            refreshKey={refreshBreakfast}
          />
          <Lunch
            className="lunch"
            username={username}
            onFoodChange={handleLunchChange}
            refreshKey={refreshLunch}
          />
          <Dinner
            className="dinner"
            username={username}
            onFoodChange={handleDinnerChange}
            refreshKey={refreshDinner}
          />
          <Snacks
            className="snacks"
            username={username}
            onFoodChange={handleSnacksChange}
            refreshKey={refreshSnacks}
          />
        </div>
      </div>
    </div>
  );
}

export default CalorieCounter;