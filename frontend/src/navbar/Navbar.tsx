import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Activity, List, Settings, LogOut, ChevronLeft, ChevronRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

  const links = [
    { name: "Accueil", path: "/acceuil", icon: <Home size={20} /> },
    { name: "Tableau de bord", path: "/tableaudebord", icon: <Activity size={20} /> },
    { name: "Liste des activités", path: "/listactivite", icon: <List size={20} /> },
    { name: "Paramètres", path: "/parametre", icon: <Settings size={20} /> },
  ];

  const handleLinkClick = (link: typeof links[0]) => {
    navigate(link.path);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Voulez-vous vraiment vous déconnecter ?");
    if (confirmed) {
      localStorage.clear();
      navigate("/");
    }
  };

  const sidebarVariants = {
    expanded: {
      width: "250px",
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 200,
      },
    },
    collapsed: {
      width: "70px",
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 200,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring" as "spring",
        stiffness: 100,
      },
    }),
  };

  return (
    <motion.div
      className="navbar-container"
      initial={false}
      animate={expanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      style={{
        backgroundColor: "#1a1a2e",
        color: "white",
        height: "100vh",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderTopRightRadius: "12px",
        borderBottomRightRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header avec logo et bouton toggle */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          justifyContent: expanded ? "space-between" : "center",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#4ade80",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1a1a2e",
                fontWeight: "bold",
              }}
            >
              DTI
            </div>
            <span style={{ fontSize: "18px", fontWeight: "600" }}>Collecte des activités</span>
          </motion.div>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={expanded ? "Réduire la navbar" : "Étendre la navbar"}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Section utilisateur */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "16px",
        }}
      >
        <motion.div
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={18} />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {localStorage.getItem("Prenom") || "Utilisateur"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                    {localStorage.getItem("Num_matricule") || "ID"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Liens de navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {links.map((link, index) => (
          <motion.div
            key={link.name}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={listItemVariants}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              onClick={() => handleLinkClick(link)}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                margin: "4px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "white",
                textDecoration: "none",
                backgroundColor:
                  window.location.pathname === link.path
                    ? "rgba(75, 85, 99, 0.5)"
                    : "transparent",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: window.location.pathname === link.path ? "#4ade80" : "#d1d5db",
                }}
              >
                {link.icon}
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <span style={{ fontSize: "14px" }}>{link.name}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bouton de déconnexion */}
      <div style={{ padding: "16px" }}>
        <motion.div
          onClick={handleLogout}
          whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#ef4444",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={20} />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: "hidden" }}
              >
                <span style={{ fontSize: "14px" }}>Déconnexion</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Navbar;
