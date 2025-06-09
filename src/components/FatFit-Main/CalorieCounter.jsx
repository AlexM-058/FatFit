// CalorieCounter.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Bar from './CalorieBar';
import './CalorieCounter.css';
import Breakfest from './breakfest';
import Lunch from './lunch';
import Dinner from './dinner';
import Snacks from './Snacks';

function CalorieCounter({ username }) {
  const [currentCalories, setCurrentCalories] = useState(0); // Starea pentru caloriile curente
  const [maxCalories, setMaxCalories] = useState(null); // Starea pentru dailyCalorieTarget
  const [loadingInitialData, setLoadingInitialData] = useState(true); // Pentru încărcarea inițială
  const [errorInitialData, setErrorInitialData] = useState(null); // Pentru erori la încărcarea inițială

  // --- Logică pentru încărcarea datelor utilizatorului (dailyCalorieTarget) ---
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

        const response = await fetch(`http://localhost:3001/fatfit/${username}`, { signal });

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
        setMaxCalories(data.dailyCalorieTarget); // Setează maxCalories

        // Acum, încarcă caloriile curente din localStorage după ce știm maxCalories
        const savedCalories = localStorage.getItem('dailyCalories');
        const lastResetDate = localStorage.getItem('lastResetDate');
        const today = new Date().toDateString();

        if (lastResetDate !== today) {
          // Dacă este o zi nouă, resetează caloriile în localStorage
          localStorage.setItem('dailyCalories', '0');
          localStorage.setItem('lastResetDate', today);
          setCurrentCalories(0);
        } else {
          // Altfel, încarcă caloriile salvate
          setCurrentCalories(savedCalories ? parseInt(savedCalories, 10) : 0);
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

  // --- Logică pentru resetarea zilnică (miezul nopții) și salvare în localStorage ---
  useEffect(() => {
    // Salvează caloriile în localStorage ori de câte ori currentCalories se schimbă
    localStorage.setItem('dailyCalories', currentCalories.toString());

    // Setează un timeout pentru resetarea la miezul nopții
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeToReset = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      setCurrentCalories(0);
      localStorage.setItem('dailyCalories', '0');
      localStorage.setItem('lastResetDate', new Date().toDateString());
    }, timeToReset);

    return () => clearTimeout(timeoutId); // Curăță timeout-ul la demontare
  }, [currentCalories]);

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