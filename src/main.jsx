import React from "react";
import ReactDOM from "react-dom/client";
import TechFinderSite from "./TechFinderSite.jsx";
import "./index.css";

console.log("MAIN LOADED"); // בדיקת טעינה

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TechFinderSite />
  </React.StrictMode>
);
