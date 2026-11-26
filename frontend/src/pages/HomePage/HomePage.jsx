import React from "react";
import Sidebar from "../../components/App_Components/Sidebar";
import Dashboard from "../Dashboard";

const HomePage = () => {
  return (
    <div className="flex flex-row">
      <div className="sidebarFrame">
        <Sidebar />
      </div>
      <div className="mainFrame bg-gray-800 p-10 flex flex-col overflow-auto">
        <Dashboard />
      </div>
    </div>
  );
};

export default HomePage;
