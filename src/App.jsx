import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./view/Components/ScrollToTop";
import Navbar from "./view/Components/Navbar";
import SignIn from "./view/SignIn/SignIn";
import AIChatBox from "./view/AI-Chat/AIChatBox";
import ContentWrapper from "./view/AI-Chat/ContentWrapper";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { user } = useAuth();
  const isAuthPage = window.location.pathname === "/auth";

  return (
    <ContentWrapper className="App">
      <Routes>
        {/* Public route */}
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" replace /> : <SignIn />} 
        />

        {/* Protected admin routes */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {/* Add AI ChatBox - appears on all pages except auth */}
      {!isAuthPage && user && <AIChatBox />}
    </ContentWrapper>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
