// ./navbar/Dashboard.tsx
import React from "react";
import Navbar from "./Navbar";
import "./Dashboard.css"; // Assurez-vous d'avoir ce fichier ou d'ajouter le CSS ailleurs

const Dashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // Utilisez un style en ligne ou une classe CSS pour le conteneur Flexbox
    <div
      className="dashboard-container"
      style={{
        display: "flex", // Active le mode flex
        minHeight: "100vh", // Assure que le conteneur prend toute la hauteur de l'écran
      }}
    >
      <Navbar />
      {/* Le contenu principal prend tout l'espace restant */}
      <main
        className="dashboard-main"
        style={{
          flexGrow: 1, // Permet au main de prendre l'espace restant
          padding: "20px", // Ajouter un peu de marge autour du contenu de la page
          overflowY: "auto", // Assure que la page peut défiler si nécessaire
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Dashboard;