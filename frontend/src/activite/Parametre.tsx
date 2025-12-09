import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSetting, setSetting } from "../db";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
  Alert,
  CircularProgress
} from "@mui/material";
import { Save as SaveIcon, Notifications as NotificationsIcon, Schedule as ScheduleIcon, Coffee as CoffeeIcon } from "@mui/icons-material";

const Parametre = () => {
  const [notifMinute, setNotifMinute] = useState("");
  const [debutTravail, setDebutTravail] = useState("");
  const [finTravail, setFinTravail] = useState("");
  const [debutPause, setDebutPause] = useState("");
  const [finPause, setFinPause] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function loadSettings() {
      const nm = await getSetting("notifMinute");
      const dt = await getSetting("debutTravail");
      const ft = await getSetting("finTravail");
      const dp = await getSetting("debutPause");
      const fp = await getSetting("finPause");
      if (nm) setNotifMinute(nm);
      if (dt) setDebutTravail(dt);
      if (ft) setFinTravail(ft);
      if (dp) setDebutPause(dp);
      if (fp) setFinPause(fp);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setSetting("notifMinute", notifMinute);
      await setSetting("debutTravail", debutTravail);
      await setSetting("finTravail", finTravail);
      await setSetting("debutPause", debutPause);
      await setSetting("finPause", finPause);
      setMessage("✅ Paramètres enregistrés avec succès !");
    } catch (error) {
      setMessage("❌ Erreur lors de l'enregistrement des paramètres");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f2f5 0%, #e8f0fe 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      p: 3
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Paper elevation={6} sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backgroundColor: "background.paper",
          width: "100%",
          maxWidth: 600,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}>
          <Stack alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{
              bgcolor: "primary.main",
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(24, 118, 210, 0.2)"
            }}>
              <SaveIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{
              fontWeight: 700,
              color: "primary.main",
              textAlign: "center"
            }}>
              Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Personnalisez vos paramètres de travail
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Section Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <NotificationsIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Notifications
                  </Typography>
                </Stack>
                <TextField
                  label="Recevoir notifications toutes les (minutes)"
                  type="number"
                  placeholder="Ex: 30"
                  value={notifMinute}
                  onChange={(e) => setNotifMinute(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 1, max: 120 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </motion.div>

              <Divider />

              {/* Section Heures de travail */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Heures de travail
                  </Typography>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Début"
                    type="time"
                    value={debutTravail}
                    onChange={(e) => setDebutTravail(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    label="Fin"
                    type="time"
                    value={finTravail}
                    onChange={(e) => setFinTravail(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Stack>
              </motion.div>

              <Divider />

              {/* Section Heures de pause */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <CoffeeIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Heures de pause
                  </Typography>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Début"
                    type="time"
                    value={debutPause}
                    onChange={(e) => setDebutPause(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    label="Fin"
                    type="time"
                    value={finPause}
                    onChange={(e) => setFinPause(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Stack>
              </motion.div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Alert
                      severity={message.includes("✅") ? "success" : "error"}
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                  boxShadow: "0 4px 12px rgba(24, 118, 210, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0, #2196f3)",
                    boxShadow: "0 6px 16px rgba(24, 118, 210, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease"
                }}
              >
                {loading ? "Enregistrement..." : "Enregistrer les paramètres"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Parametre;
