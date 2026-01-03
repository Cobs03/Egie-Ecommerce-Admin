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
import ForgotPassword from "./view/ForgotPassword/ForgotPassword";
import ResetPassword from "./view/ResetPassword/ResetPassword";
import ContentWrapper from "./view/AI-Chat/ContentWrapper";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, profile, isAdmin } = useAuth();
  const [maxLoadingTimeout, setMaxLoadingTimeout] = React.useState(false);

  // Safety timeout - if loading takes more than 15 seconds, show error
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.error('⏱️ App loading timeout after 15 seconds');
        setMaxLoadingTimeout(true);
      }, 15000);

      return () => clearTimeout(timeout);
    } else {
      setMaxLoadingTimeout(false);
    }
  }, [loading]);

  if (maxLoadingTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Loading Timeout</h2>
          <p className="text-gray-600 mb-4">
            The page is taking too long to load. This might be due to a connection issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

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

  // CRITICAL SECURITY CHECK: Only allow admin, manager, or employee
  const isAuthorized = isAdmin === true || 
    ['admin', 'manager', 'employee'].includes(profile?.role?.toLowerCase());

  if (!loading && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You do not have permission to access the admin panel.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Only administrators, managers, and employees can access this area.
          </p>
          <button
            onClick={() => {
              // Sign out and redirect to auth page
              window.location.href = '/auth';
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Main App Content
const AppContent = () => {
  const { user, profile } = useAuth();
  const isAuthPage = window.location.pathname === "/auth";

  // Check if user is authorized (admin, manager, or employee)
  const isAuthorized = profile?.is_admin === true || 
    ['admin', 'manager', 'employee'].includes(profile?.role?.toLowerCase());

  return (
    <ContentWrapper className="App">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/auth" 
          element={(user && isAuthorized) ? <Navigate to="/dashboard" replace /> : <SignIn />} 
        />
        <Route 
          path="/forgot-password" 
          element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
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
