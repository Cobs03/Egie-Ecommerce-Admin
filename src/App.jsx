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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ContentWrapper className="App">
        <Routes>
          {/* Public route */}
          <Route path="/auth" element={<SignIn />} />

          {/* Admin dashboard - catch all nested paths */}
          <Route path="/*" element={<Navbar />} />
        </Routes>

        {/* Add AI ChatBox - appears on all pages */}
        <AIChatBox />
      </ContentWrapper>
    </Router>
  );
}

export default App;
