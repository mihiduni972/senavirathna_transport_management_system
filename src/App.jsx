import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Hires from "./pages/Hires";
import Fuel from "./pages/Fuel";
import Repairs from "./pages/Repairs";
import Expenses from "./pages/Expenses";
import FareCalculator from "./pages/FareCalculator";
import Calls from "./pages/Calls";
import Vehicles from "./pages/Vehicles";

import BirthdayLaunch from "./components/BirthdayLaunch";


// =====================================================
// PRIVATE ROUTE
// =====================================================

function PrivateRoute({ children }) {

  const { token } = useAuth();

  return token
    ? children
    : <Navigate to="/login" replace />;
}


// =====================================================
// APP
// =====================================================

function App() {

  // ===================================================
  // TEMPORARY TEST MODE
  // ===================================================
  // true  = Birthday launch screen
  // false = Normal system
  //
  // දැනට testing සඳහා true තියාගන්න.
  // ===================================================

  const [showLaunch, setShowLaunch] = useState(true);


  // ===================================================
  // BIRTHDAY LAUNCH SCREEN
  // ===================================================

  if (showLaunch) {

    return (
      <BirthdayLaunch
        onLaunchComplete={() => {
          setShowLaunch(false);
        }}
      />
    );

  }


  // ===================================================
  // NORMAL SYSTEM
  // ===================================================

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>

          {/* LOGIN */}
          <Route
            path="/login"
            element={<Login />}
          />


          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />


          {/* FARE */}
          <Route
            path="/fare"
            element={
              <PrivateRoute>
                <FareCalculator />
              </PrivateRoute>
            }
          />


          {/* CALLS */}
          <Route
            path="/calls"
            element={
              <PrivateRoute>
                <Calls />
              </PrivateRoute>
            }
          />


          {/* HIRES */}
          <Route
            path="/hires"
            element={
              <PrivateRoute>
                <Hires />
              </PrivateRoute>
            }
          />


          {/* FUEL */}
          <Route
            path="/fuel"
            element={
              <PrivateRoute>
                <Fuel />
              </PrivateRoute>
            }
          />


          {/* REPAIRS */}
          <Route
            path="/repairs"
            element={
              <PrivateRoute>
                <Repairs />
              </PrivateRoute>
            }
          />


          {/* EXPENSES */}
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />


          {/* VEHICLES */}
          <Route
            path="/vehicles"
            element={
              <PrivateRoute>
                <Vehicles />
              </PrivateRoute>
            }
          />


          {/* UNKNOWN URL */}
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );
}


export default App;