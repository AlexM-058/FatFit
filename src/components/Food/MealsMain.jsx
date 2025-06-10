import React from "react";
import { useParams } from "react-router-dom";
import Search from "./Search";
import "./MealsMain.css"; 
const MealsMain = () => {
  const { username } = useParams(); 
  console.log("Username from URL:", username);
  return (
    <div className="meals-main-container">
      <h2 className="meals-title">Meals</h2>
      <p className="meals-description">Here you can find meal plans and recipes.</p>
      <Search username={username} />
    </div>
  );
};

export default MealsMain;
