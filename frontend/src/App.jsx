import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Users from "./components/Users";
import Profile from "./components/Profile";
import Emergency from "./components/Emergency";
import Counselling from "./components/Counselling";
import LiveLocation from "./components/LiveLocation";
import Community from "./components/Community";
import LiveAlerts from "./components/LiveAlerts";
import RecentAlerts from "./components/RecentAlerts";
import ManageCounselling from "./components/ManageCounselling";
import AdminReports from "./components/AdminReports";
import Feedback from "./components/Feedback";
import AdminFeedbacks from "./components/AdminFeedbacks";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing / Home */}
        <Route path="/" element={<Home />} />

        {/* Dashboards */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Admin Pages */}
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/alerts" element={<LiveAlerts />} />
        <Route path="/admin/counselling" element={<ManageCounselling />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />


        {/* Individual Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/counselling" element={<Counselling />} />
        <Route path="/location" element={<LiveLocation />} />
        <Route path="/community" element={<Community />} />
        <Route path="/alerts-history" element={<RecentAlerts />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* Fallback */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
};

export default App;
