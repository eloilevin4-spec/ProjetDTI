import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { addEmploye, findEmployeByNumMatricule } from "./db";
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
  Divider,
  Stack,
  InputAdornment,
  Fade
} from "@mui/material";
import { LockOutlined, PersonAddOutlined, AccountCircleOutlined, BadgeOutlined, WorkOutlineOutlined, HomeWorkOutlined, LocationCityOutlined, CorporateFareOutlined } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, Variants } from "framer-motion";

// Définition des types pour les animations
const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.43, 0.13, 0.23, 0.96] // Easing personnalisé
    }
  }
};

// Thème moderne 2025
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#8b5cf6',
      dark: '#4f46e5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    error: {
      main: '#f87171',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
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

// Interface pour les données du formulaire
interface FormData {
  Nom: string;
  Prenom: string;
  Num_matricule: string;
  Num_cin: string;
  Mdp: string;
  C_direction: string;
  C_service: string;
  C_departement: string;
  C_bureau: string;
}

// Interface pour les champs du formulaire
interface FormField {
  name: keyof FormData;
  label: string;
  type: string;
  required: boolean;
  icon: React.ReactNode;
}

const fieldIcons = {
  Nom: <AccountCircleOutlined />,
  Prenom: <AccountCircleOutlined />,
  Num_matricule: <BadgeOutlined />,
  Num_cin: <BadgeOutlined />,
  Mdp: <LockOutlined />,
  C_direction: <CorporateFareOutlined />,
  C_service: <WorkOutlineOutlined />,
  C_departement: <LocationCityOutlined />,
  C_bureau: <HomeWorkOutlined />,
};

const Creercompte = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    Nom: "",
    Prenom: "",
    Num_matricule: "",
    Num_cin: "",
    Mdp: "",
    C_direction: "",
    C_service: "",
    C_departement: "",
    C_bureau: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as keyof FormData]: value
    }));
  };

  const handleCreate = async () => {
    const { Nom, Prenom, Num_matricule, Num_cin, Mdp, C_direction, C_departement, C_bureau } = formData;

    if (!Nom || !Prenom || !Num_matricule || !Num_cin || !Mdp || !C_direction || !C_departement || !C_bureau) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    try {
      const exist = await findEmployeByNumMatricule(Num_matricule);
      if (exist) {
        setMessage("Ce numéro de matricule existe déjà !");
        return;
      }

      const newUser = {
        Num_matricule,
        Nom,
        Prenom,
        Num_cin,
        Mdp,
        Pseudo: Prenom.toLowerCase() + Num_matricule,
        C_direction,
        C_service: formData.C_service,
        C_departement,
        C_bureau,
      };

      await addEmploye(newUser);
      setMessage("Compte créé avec succès !");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const formFields: FormField[] = [
    { name: "Nom", label: "Nom", type: "text", required: true, icon: fieldIcons.Nom },
    { name: "Prenom", label: "Prénom", type: "text", required: true, icon: fieldIcons.Prenom },
    { name: "Num_matricule", label: "Numéro de matricule", type: "text", required: true, icon: fieldIcons.Num_matricule },
    { name: "Num_cin", label: "Numéro CIN", type: "text", required: true, icon: fieldIcons.Num_cin },
    { name: "Mdp", label: "Mot de passe", type: "password", required: true, icon: fieldIcons.Mdp },
    { name: "C_direction", label: "Direction", type: "text", required: true, icon: fieldIcons.C_direction },
    { name: "C_service", label: "Service (optionnel)", type: "text", required: false, icon: fieldIcons.C_service },
    { name: "C_departement", label: "Département", type: "text", required: true, icon: fieldIcons.C_departement },
    { name: "C_bureau", label: "Bureau", type: "text", required: true, icon: fieldIcons.C_bureau },
  ];

  const renderFormFields = () => {
    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          {formFields.slice(0, 4).map((field, index) => (
            <motion.div
              key={field.name}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {field.icon}
                    </InputAdornment>
                  ),
                  style: {
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(99, 102, 241, 0.8)',
                      borderWidth: '1.5px',
                    },
                  },
                }}
              />
            </motion.div>
          ))}
        </Stack>

        <Stack spacing={2} sx={{ flex: 1 }}>
          {formFields.slice(4).map((field, index) => (
            <motion.div
              key={field.name}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: (index + 4) * 0.1 }}
            >
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {field.icon}
                    </InputAdornment>
                  ),
                  style: {
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(99, 102, 241, 0.8)',
                      borderWidth: '1.5px',
                    },
                  },
                }}
              />
            </motion.div>
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <Paper elevation={12} sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 900,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{
                m: 1,
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                <PersonAddOutlined sx={{ fontSize: 32 }} />
              </Avatar>

              <Typography component="h1" variant="h4" sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg, #1e293b 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center'
              }}>
                Créer un compte
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 500 }}>
                Complétez les informations ci-dessous pour créer votre compte professionnel
              </Typography>

              <Box sx={{ width: '100%', mt: 2 }}>
                {renderFormFields()}
              </Box>

              {message && (
                <Fade in={!!message}>
                  <Alert
                    severity={message.includes("succès") ? "success" : "error"}
                    sx={{
                      width: '100%',
                      mt: 2,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: 2
                    }}
                  >
                    {message}
                  </Alert>
                </Fade>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleCreate}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5856eb 0%, #7c3aed 100%)',
                    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOutlined />}
              >
                {loading ? "Création en cours..." : "Créer le compte"}
              </Button>

              <Divider sx={{ my: 3, width: '80%' }} />

              <Link
                component={RouterLink}
                to="/"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Déjà un compte ? Se connecter
              </Link>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default Creercompte;
