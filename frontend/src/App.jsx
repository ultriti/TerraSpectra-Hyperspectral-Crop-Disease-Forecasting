import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import ModelEvaluation from "./components/Evaluation/ModelEvaluation";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/model-evaluation" element={<ModelEvaluation />} />
      </Routes>
    </Router>
  );
};

export default App;
