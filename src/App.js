import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CompletedTrip from "./components/CompletedTrip";
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
    // console.log("🚀 ~ file: App.js:10 ~ checkLogin ~ userData:", userData)
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
            {/* <Dashboard />
          <ActiveTrip/> */}

            <Routes>
              <Route path="/" element={<ActiveWander />} />
              <Route path="active/wander" element={<ActiveWander />} />
              <Route path="completed/wander" element={<CompletedTrip />} />
              <Route path="invite" element={<Invite />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/view" element={<ReportsView />} />
              {/* <Route path="templates/temp1" element={<Preview />} />
            <Route path="templates/temp2" element={<Templete2 />} />
            <Route path="templates/temp3" element={<Developing />} />
            <Route path="templates/temp4" element={<Developing />} />
            <Route path="templates" element={<TemplateSelection />} /> */}
              {/* <Route path="about" element={<Aboutus />} /> */}
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
