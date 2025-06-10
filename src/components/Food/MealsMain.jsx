import React from "react";
import { useParams, Navigate } from "react-router-dom";
import Search from "./Search";
import "./MealsMain.css"; 

const MealsMain = () => {
  const { username } = useParams(); 
  if (!username) {
    // Redirect to home or login if username is missing (prevents 404 on refresh)
    return <Navigate to="/" replace />;
  }
  return (
    <div className="meals-main-container">
      <h2 className="meals-title">Meals</h2>
      <p className="meals-description">Here you can find meal plans and recipes.</p>
      <Search username={username} />
    </div>
  );
};

export default MealsMain;
