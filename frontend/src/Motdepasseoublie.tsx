import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findEmployeByNumMatricule, updateEmployePassword } from "./db";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  Link,
  CircularProgress,
  CssBaseline,
  Avatar,
  Stack,
  InputAdornment,
  IconButton
} from "@mui/material";
import { LockReset, Badge, Fingerprint, Visibility, VisibilityOff } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      contrastText: '#fff',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const Motdepasseoublie = () => {
  const [Num_matricule, setNum_matricule] = useState("");
  const [numCin, setNumCin] = useState("");
  const [newMdp, setNewMdp] = useState("");
  const [cmpMdp, setCmpMdp] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const verif = () => {
    if (newMdp && cmpMdp) {
      setPasswordsMatch(newMdp === cmpMdp);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    if (!Num_matricule || !numCin || !newMdp || !cmpMdp) {
      setMessage("⚠️ Veuillez remplir tous les champs.");
      return;
    }
    if (newMdp !== cmpMdp) {
      setMessage("⚠️ Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const employe = await findEmployeByNumMatricule(Num_matricule);
      if (!employe) {
        setMessage("❌ Numéro de matricule incorrect.");
        return;
      }
      if (employe.Num_cin !== numCin) {
        setMessage("❌ Numéro CIN incorrect.");
        return;
      }
      await updateEmployePassword(Num_matricule, newMdp);
      setMessage("✅ Mot de passe mis à jour avec succès !");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error(error);
      setMessage("🚫 Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={12} sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: "background.paper",
            width: "100%",
            maxWidth: 450,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}>
            <Stack alignItems="center" spacing={2} mb={3}>
              <Avatar sx={{
                bgcolor: "primary.main",
                width: 56,
                height: 56,
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
              }}>
                <LockReset fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                color: "primary.main",
                textAlign: "center"
              }}>
                Réinitialisation du mot de passe
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Veuillez entrer vos informations pour réinitialiser votre mot de passe
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <TextField
                  label="Numéro de matricule"
                  type="text"
                  value={Num_matricule}
                  onChange={(e) => setNum_matricule(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="Numéro CIN"
                  type="text"
                  value={numCin}
                  onChange={(e) => setNumCin(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Fingerprint color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="Nouveau mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={newMdp}
                  onChange={(e) => {
                    setNewMdp(e.target.value);
                    if (cmpMdp) verif();
                  }}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockReset color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? "text" : "password"}
                  value={cmpMdp}
                  onChange={(e) => {
                    setCmpMdp(e.target.value);
                    verif();
                  }}
                  onBlur={verif}
                  fullWidth
                  variant="outlined"
                  error={passwordsMatch === false}
                  helperText={passwordsMatch === false ? "Les mots de passe ne correspondent pas" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockReset color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert
                        severity={
                          message.includes("✅") ? "success" :
                          message.includes("⚠️") ? "warning" : "error"
                        }
                        sx={{ mt: 2 }}
                      >
                        {message}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockReset />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb, #1e40af)",
                      boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link component="button" onClick={() => navigate("/")} variant="body2" sx={{ color: 'primary.main' }}>
                    Retour à la connexion
                  </Link>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default Motdepasseoublie;
