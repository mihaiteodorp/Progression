// import { useEffect, useState } from "react";

import { Route, Routes } from "react-router";
import './App.module.css';

import SummaryPage from './pages/SummaryPage';
import WorkoutsPage from './pages/WorkoutsPage';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";



function App() {


  return (
    <Routes>
      <Route element={<PublicRoute />} >
        <Route element={<AuthLayout />} >
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />} >
        <Route element={<AppLayout />} >
          <Route path='/' element={<SummaryPage />} />
          <Route path='/workouts' element={<WorkoutsPage  />} />
        </Route>
      </Route>

    </Routes>


  );
}

export default App;

