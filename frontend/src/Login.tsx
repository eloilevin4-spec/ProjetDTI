import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { findEmployeByNumMatricule } from "./db";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [Num_matricule, setNum_matricule] = useState("");
  const [Mdp, setMdp] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const employe = await findEmployeByNumMatricule(Num_matricule);
      if (!employe) {
        setMessage("Numéro de matricule incorrect");
        return;
      }
      if (employe.Mdp === Mdp) {
        localStorage.setItem("Num_matricule", employe.Num_matricule);
        localStorage.setItem("Prenom", employe.Prenom);
        navigate("/acceuil");
      } else {
        setMessage("Mot de passe incorrect");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur de communication avec la base de données.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f5f7fa"
    }}>
      {/* Partie gauche avec le design bleu */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Motif de fond */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.05) 50%, transparent 51%)
          `,
          backgroundSize: "200px 200px, 150px 150px, 40px 40px",
          opacity: 0.3
        }} />

        {/* Contenu textuel */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
            color: "white"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px"
            }}>
              🏢
            </div>
            <span style={{ fontSize: "18px", fontWeight: "600" }}>BANKY FOIBEN' I MADAGASIKARA</span>
          </div>

          <h1 style={{
            color: "white",
            fontSize: "48px",
            fontWeight: "300",
            marginBottom: "10px",
            lineHeight: "1.2"
          }}>
            DTI DASHBOARD
          </h1>

          <h2 style={{
            color: "white",
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "20px",
            borderBottom: "3px solid white",
            display: "inline-block",
            paddingBottom: "10px"
          }}>
            BIENVENUE DANS VOTRE ESPACE
          </h2>

          <p style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px",
            maxWidth: "400px",
            margin: "0 auto",
            lineHeight: "1.5"
          }}>
           Outils créer pour faciliter la gestion des activités du personnel de la BFM 
          </p>
        </div>
      </div>

      {/* Partie droite avec le formulaire */}
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        backgroundColor: "white"
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: "600",
            marginBottom: "30px",
            color: "#1e3a8a"
          }}>
            Login Account
          </h2>

          <p style={{
            color: "#6b7280",
            fontSize: "14px",
            marginBottom: "30px",
            lineHeight: "1.5"
          }}>
           Authentification d'un personnel de la BFM
          </p>

          <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                color: "#1e3a8a",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center"
              }}>
                <span style={{
                  display: "inline-block",
                  width: "3px",
                  height: "16px",
                  backgroundColor: "#1e3a8a",
                  marginRight: "8px"
                }}></span>
                Numéro de matricule
              </label>
              <input
                type="text"
                placeholder=""
                value={Num_matricule}
                onChange={(e) => setNum_matricule(e.target.value)}
                className="login-input"
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  width: "100%"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                color: "#1e3a8a",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center"
              }}>
                <span style={{
                  display: "inline-block",
                  width: "3px",
                  height: "16px",
                  backgroundColor: "#1e3a8a",
                  marginRight: "8px"
                }}></span>
                Mot de passe
              </label>
              <input
                type="password"
                placeholder=""
                value={Mdp}
                onChange={(e) => setMdp(e.target.value)}
                className="login-input"
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  width: "100%"
                }}
              />
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "14px", color: "#6b7280" }}>Keep me signed in</span>
              </label>
              <Link to="/motdepasseoublie" style={{
                fontSize: "14px",
                color: "#1e3a8a",
                textDecoration: "none"
              }}>
                Mot de passe oublié?
              </Link>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="login-button"
              style={{
                padding: "14px 20px",
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isLoading ? 0.7 : 1,
                width: "100%"
              }}
            >
              {isLoading ? "Connexion en cours..." : "SUBSCRIBE"}
            </button>

            {message && <p style={{
              color: "#ef4444",
              fontSize: "14px",
              textAlign: "center",
              marginTop: "10px"
            }}>
              {message}
            </p>}

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link to="/creercompte" style={{
                fontSize: "14px",
                color: "#1e3a8a",
                textDecoration: "none",
                fontWeight: "500"
              }}>
                Créer un compte
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
