import React from "react";
import "./Search.css";
import { useState } from "react";
import FoodBlock from "../recursive/blocks/FoodBlock.jsx";
import { httpRequest } from "../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

const Search = ({ username }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await httpRequest(
        `${API_URL}/fatsecret-search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for food..."
      />
      <div className="answers">
        {results.map((food) => (
          <div key={food.food_id} style={{ marginBottom: 16 }}>
            <FoodBlock food={food} username={username} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
