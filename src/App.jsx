import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./view/Components/ScrollToTop";
import DashboardLayoutBasic from "./view/Components/Navbar";
import Login from "./view/LogIn/Login";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public route */}
        <Route path="/auth" element={<Login />} />

        {/* Admin dashboard - catch all nested paths */}
        <Route path="/*" element={<DashboardLayoutBasic />} />
      </Routes>
    </Router>
  );
}

export default App;
