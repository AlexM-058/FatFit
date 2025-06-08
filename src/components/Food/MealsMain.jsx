import React from "react";
import { useParams } from "react-router-dom";
import Search from "./Search";

const MealsMain = () => {
  const { username } = useParams(); 
  console.log("Username from URL:", username);
  return (
    <div>
      <h2>Meals</h2>
      <p>Here you can find meal plans and recipes.</p>
      <Search username={username} />
    </div>
  );
};

export default MealsMain;
