import React from 'react'
import {BrowserRouter as Router , Route,Routes } from "react-router-dom"
import HomePage from './pages/Homepage/HomePage'
import PredictionPage from './pages/Prediction Page/PredictionPage'
import Dashboard from './pages/Homepage/Dashboard'
import AboutUs from './pages/Homepage/Aboutus'


const App = () => {
  return (
    <Router>

      <Routes>
        <Route path={"/"} element={<HomePage/>}/>
        <Route path={"/predictionPage"} element={<PredictionPage/>}/>
        <Route path={"/Dashboard"} element={<Dashboard/>}/>
        <Route path={"/Aboutus"} element={<AboutUs/>}/>
      </Routes>
      
    </Router>
  )
}

export default App



