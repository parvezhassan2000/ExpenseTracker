import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from "./store/AuthProvider";
import Signup from "./components/Signup";
import Login from "./components/Login";
import IncompleteProfile from "./components/profile/IncompleteProfile";
import CompleteProfile from "./components/profile/CompleteProfile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes> {/* Remove the 'a' after Routes - it was causing an error */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/incompleteProfile" element={<IncompleteProfile />} />
          <Route path="/profile/complete" element={<CompleteProfile />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;