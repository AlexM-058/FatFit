import React, { useState, useRef } from "react";
import "./Search.css";
import FoodBlock from "../recursive/blocks/FoodBlock.jsx";
import { httpRequest } from "../../utils/http";
const API_URL = import.meta.env.VITE_API_URL;

const Search = ({ username }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  const handleSearch = async (q) => {
    console.log("start searching :", q);
    try {
      const response = await httpRequest(
        `${API_URL}/fatsecret-search?q=${encodeURIComponent(q)}`
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (value.trim() !== "") {
        handleSearch(value);
      }
    }, 1500); 
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      handleSearch(query);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
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
