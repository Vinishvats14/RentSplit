// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex">
      {/* Sidebar fixed on left */}
      <Sidebar />

      {/* Page content area */}
      <div className="ml-64 w-full min-h-screen bg-gray-50 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
