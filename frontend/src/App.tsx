// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Login from "./Login";
import Motdepasseoublie from "./Motdepasseoublie";
import Acceuil from "./activite/Acceuil";
import Parametre from "./activite/Parametre";
import Tableaudebord from "./activite/Tableaudebord";
import Listactivite from "./log/Listactivite";
import DashboardLayout from "./navbar/Dashboard";
import Creercompte from "./Creercompte";

// Notification Provider
import { NotificationProvider } from "./activite/NotificationProvider";

function App() {
  // Définir les pages autorisées à recevoir les notifications
  const pagesNotif = [
    "/acceuil",
    "/parametre",
    "/tableaudebord",
    "/listactivite"
  ];

  return (
    <Router>
      {/* NotificationProvider englobe tout le router pour gérer les notifications */}
      <NotificationProvider allowedPaths={pagesNotif}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/motdepasseoublie" element={<Motdepasseoublie />} />
          <Route path="/creercompte" element={<Creercompte />} />


          {/* Pages avec Navbar */}
          <Route
            path="/acceuil"
            element={
              <DashboardLayout>
                <Acceuil />
              </DashboardLayout>
            }
          />
          <Route
            path="/parametre"
            element={
              <DashboardLayout>
                <Parametre />
              </DashboardLayout>
            }
          />
          <Route
            path="/tableaudebord"
            element={
              <DashboardLayout>
                <Tableaudebord />
              </DashboardLayout>
            }
          />
          <Route
            path="/listactivite"
            element={
              <DashboardLayout>
                <Listactivite />
              </DashboardLayout>
            }
          />
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;
