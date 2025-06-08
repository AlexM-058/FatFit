// CalorieCounter.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Bar from './CalorieBar';
import './CalorieCounter.css';
import Breakfest from './breakfest';
import Lunch from './lunch';
import Dinner from './dinner';
import Snacks from '../FatFit-Main/Snacks';

const API_URL = import.meta.env.VITE_API_URL;

function CalorieCounter({ username }) {
  const [currentCalories, setCurrentCalories] = useState(0); 
  const [maxCalories, setMaxCalories] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true); 
  const [errorInitialData, setErrorInitialData] = useState(null);

  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchUserDataAndDailyTarget() {
      try {
        setLoadingInitialData(true);
        setErrorInitialData(null);

        if (typeof username !== 'string' || !username) {
          console.error("CalorieCounter: Username prop is missing or invalid.");
          setErrorInitialData("Username not available. Please log in.");
          setLoadingInitialData(false);
          return;
        }

        // Ia datele userului și caloriile din backend
        const response = await fetch(`${API_URL}/fatfit/${username}`, { signal });
        if (signal.aborted) {
          console.log("Fetch for user data was aborted (CalorieCounter).");
          return;
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          console.error("Backend error response for user data:", errorData.message || response.statusText);
          setErrorInitialData(errorData.message || "Error loading user data.");
          return;
        }
        const data = await response.json();
        setMaxCalories(data.dailyCalorieTarget);

        // Ia caloriile curente din backend (exemplu: /caloriecounter/:username/total)
        const calRes = await fetch(`${API_URL}/caloriecounter/${username}/total`, { signal });
        if (calRes.ok) {
          const calData = await calRes.json();
          setCurrentCalories(Number(calData.totalCalories) || 0);
        } else {
          setCurrentCalories(0);
        }

      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted:', err.message);
        } else {
          console.error("Error fetching user data in CalorieCounter:", err);
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
  }, [username]); 

   useEffect(() => {
    // Salvează caloriile în backend ori de câte ori currentCalories se schimbă
    if (typeof username === 'string' && username) {
      fetch(`${API_URL}/caloriecounter/${username}/total`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalCalories: currentCalories })
      }).catch((err) => {
        console.error("Failed to save calories to backend:", err);
      });
    }

    // Setează un timeout pentru resetarea la miezul nopții
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeToReset = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      setCurrentCalories(0);
      // Poți trimite și la backend resetarea dacă vrei
      if (typeof username === 'string' && username) {
        fetch(`${API_URL}/caloriecounter/${username}/total`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalCalories: 0 })
        }).catch(() => {});
      }
    }, timeToReset);

    return () => clearTimeout(timeoutId); // Curăță timeout-ul la demontare
  }, [currentCalories, username]);

  // --- Funcție de callback pentru a actualiza caloriile (folosită de Bar și FoodBlock) ---
  const handleUpdateCalories = useCallback((newAmount) => {
    setCurrentCalories(newAmount);
  }, []);


  if (loadingInitialData) return <p>Loading user calorie data...</p>;
  if (errorInitialData) return <div className="error-message">Error: {errorInitialData}</div>;
  if (maxCalories === null) return <p>No daily calorie target available for this user.</p>;


  return (
    <div className="calorie-counter-container">
      <h2>Calorie Monitoring</h2>
      <p>Daily target: <strong>{maxCalories} kcal</strong></p>

      <Bar
        maxCalories={maxCalories}
        username={username}
        currentCalories={currentCalories}
        onUpdateCalories={handleUpdateCalories}
      />
      <div className="meal-sections">
        <h3>Meals</h3>
        <div className="meal-section">
        <Breakfest username={username} />
        <Lunch username={username} />
          <Dinner username={username} />
          <Snacks username={username} />
            </div>
        </div>
      </div>
  );
}

export default CalorieCounter;