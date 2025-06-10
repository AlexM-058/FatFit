import React, { useState } from "react";
import { submitAnswers } from "../api/fatfit";


export default function QuizForm({ username }) {
 
  const [answers, setAnswers] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    goal: "lose",
    targetDate: ""
  });
  
  const [mealPlan, setMealPlan] = useState(null);
  const [dailyCalories, setDailyCalories] = useState(null);


  const handleChange = e =>
    setAnswers({ ...answers, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await submitAnswers({ username, answers });
    setMealPlan(result.mealPlan || null);
    setDailyCalories(result.dailyCalories || null);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* User input fields for quiz */}
      <input name="age" placeholder="Age" onChange={handleChange} required />
      <input name="height" placeholder="Height (cm)" onChange={handleChange} required />
      <input name="weight" placeholder="Weight (kg)" onChange={handleChange} required />
      <select name="gender" onChange={handleChange} value={answers.gender}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <select name="goal" onChange={handleChange} value={answers.goal}>
        <option value="lose">Lose Weight</option>
        <option value="keep">Keep Weight</option>
        <option value="gain">Gain Weight</option>
      </select>
      <input name="targetDate" placeholder="Target Date" type="date" onChange={handleChange} required />
      <button type="submit">Submit</button>
      {/* Display meal plan and calories */}
      {dailyCalories && <div>Daily Calories: {dailyCalories}</div>}
      {mealPlan && mealPlan.meals && (
        <ul>
          {mealPlan.meals.map(meal => (
            <li key={meal.id}>
              {meal.title} ({meal.readyInMinutes} min, {meal.servings} servings)
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
