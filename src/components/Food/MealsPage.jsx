// import React, { useState } from "react";
// import { useOutletContext, useParams } from "react-router-dom";
// import "./RecipesPage.css"; // reuse grid styles
// import PopupFood from "../recursive/blocks/PopUpFood";


// const FoodBlock = ({ food, onAdd }) => {
//   const calories =
//     (food.serving_sizes && food.serving_sizes[0]?.calories) ||
//     food.nf_calories ||
//     food.calories ||
//     0;
//   return (
//     <div
//       className="recipe-item-card"
//       style={{
//         minHeight: 120,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//       onClick={() => onAdd && onAdd(food, calories)}
//     >
//       <div style={{ fontWeight: 600, marginBottom: 6 }}>
//         {food.food_name || food.name}
//       </div>
//       <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
//         {food.brand_name ? <span>Brand: {food.brand_name}</span> : null}
//       </div>
//       <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
//         Calories: {calories}
//       </div>
     
//     </div>
//   );
// };

// const MealsPage = () => {
//   const outletContext = useOutletContext();
//   const { username } = useParams(); // Extract username from URL params
//   const { handleAddFoodFromMeals } = outletContext || {};
//   const [query, setQuery] = useState("");
//   const [foods, setFoods] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [testValue, setTestValue] = useState("");
//   const [popupFood, setPopupFood] = useState(null);

// // Search foods
// const handleSearch = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");
//   setFoods([]);
//   try {
//     const res = await fetch(
//       `http://localhost:3001/fatsecret-search?q=${encodeURIComponent(query)}`
//     );
//     if (!res.ok) throw new Error("Failed to fetch foods");
//     const data = await res.json();
//     setFoods(Array.isArray(data) ? data.slice(0, 20) : []);
//   } catch (err) {
//     setError(err.message || "Unknown error");
//   } finally {
//     setLoading(false);
//   }
// };

// // Test button handler
// const handleTestAdd = () => {
//   if (!testValue) return;
//   handleAddFoodFromMeals(testValue);
//   setTestValue("");
// };

// const handleFoodBlockAdd = (food, calories) => {
//   setPopupFood({ food, calories });
// };

// const handleClosePopup = () => {
//   setPopupFood(null);
// };

//   return (
//     <div className="recipes-page-container">
//       <form onSubmit={handleSearch} className="recipes-search-form">
//         <input
//           type="text"
//           placeholder="Search for foods..."
//           value={query}
//           onChange={e => setQuery(e.target.value)}
//         />
//         <button type="submit">Search</button>
//       </form>
//       <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: 8 }}>
//         <input
//           type="text"
//           placeholder="Test add value"
//           value={testValue}
//           onChange={e => setTestValue(e.target.value)}
//         />
//         <button type="button" onClick={handleTestAdd}>
//           Test Add
//         </button>
//       </div>
//       {loading && <div>Loading foods...</div>}
//       {error && <div style={{ color: "red" }}>{error}</div>}
//       <div className="recipes-grid">
//         {foods.map((food, idx) => (
//           <FoodBlock
//             key={food.food_id || food.id || idx}
//             food={food}
//             onAdd={handleFoodBlockAdd}
//             username={username}
//           />
//         ))}
//       </div>
//       {popupFood && (
//         <div
//           style={{
//             position: "fixed",
//             zIndex: 9999,
//             left: 0,
//             top: 0,
//             width: "100vw",
//             height: "100vh",
//             background: "rgba(0,0,0,0.3)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}
//         >
//           <PopupFood
//             food={popupFood.food}
//             calories={popupFood.calories}
//             onClose={handleClosePopup}
//             username={username}
//           />
//         </div>
//       )}
//     </div>
//   );
// };
// export default MealsPage;

