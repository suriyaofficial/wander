import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Reports from "./components/Reports";
import ActiveWander from "./components/ActiveWander";
import Invite from "./components/Invite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportsView from "./components/ReportsView";
const queryClient = new QueryClient();
function App() {
  useEffect(() => {
    checkLogin();
  }, [0]);
  const [login, setLogin] = useState(false);
  const checkLogin = () => {
    let userData = localStorage.getItem("user");
    if (userData) {
      setLogin(true);
      console.log("truuuuu");
    } else {
      console.log("false");
      setLogin(false);
    }
  };
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {login ? (
          <Router>
            <Navbar />
            <Routes>
              <Route path="/wander" element={<ActiveWander />} />
              <Route path="/wander/active/wander" element={<ActiveWander />} />
              <Route path="/wander/invite" element={<Invite />} />
              <Route path="/wander/reports" element={<Reports />} />
              <Route path="/wander/reports/view" element={<ReportsView />} />
            </Routes>
          </Router>
        ) : (
          <Login />
        )}
      </QueryClientProvider>
    </>
  );
}

export default App;
