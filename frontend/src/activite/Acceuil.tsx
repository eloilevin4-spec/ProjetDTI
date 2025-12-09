import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllActivites, addLog, getLogsByEmploye } from "../db";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Modal,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";

// ======================
// UTILS SIMILARITE
// ======================
function similarityScore(a: string, b: string) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return 1;
  let matches = 0;
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length);
}

interface ActiviteLog {
  Id_logs: number;
  Id_activite: string;
  L_activite: string;
  Date_activite: string;
  Duree: number;
}

const Accueil = () => {
  const Num_matricule = localStorage.getItem("Num_matricule") || "";
  const Prenom = localStorage.getItem("Prenom") || "";
  const navigate = useNavigate();
  const [activites, setActivites] = useState<ActiviteLog[]>([]);
  const [nouvelleActivite, setNouvelleActivite] = useState("");
  const [listeActivites, setListeActivites] = useState<{ Id_activite: string; L_activite: string }[]>([]);
  const [suggestionsIA, setSuggestionsIA] = useState<string[]>([]);
  const [estValide, setEstValide] = useState(true);
  const [valideIA, setValideIA] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [duree, setDuree] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const dureesOptions = [30, 60, 90, 120, 150, 180, 210, 240];
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showActivities, setShowActivities] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Animations
  const listAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const modalAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  // ========================
  // FETCH DERNIERES ACTIVITES
  // ========================
  const handleFetch = async () => {
    if (!Num_matricule) return;
    setIsLoading(true);
    try {
      const logs = await getLogsByEmploye(Num_matricule);
      const toutesActivites = await getAllActivites();
      const logsAvecNom = logs.map((log) => {
        const act = toutesActivites.find(
          (a) => String(a.Id_activite) === String(log.Id_activite)
        );
        return { ...log, L_activite: act?.L_activite || "-" };
      });
      logsAvecNom.sort(
        (a, b) =>
          new Date(b.Date_activite).getTime() - new Date(a.Date_activite).getTime()
      );
      setActivites(logsAvecNom.slice(0, 5));
    } catch (err) {
      console.error("Erreur logs :", err);
      setMessage("Erreur de connexion à la base locale");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  // ========================
  // AUTOCOMPLETE
  // ========================
  const afficherActivite = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNouvelleActivite(val);
    setValideIA(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      if (!val.trim()) {
        setListeActivites([]);
        setSuggestionsIA([]);
        setEstValide(true);
        return;
      }
      try {
        const toutes = await getAllActivites();
        const filtered = toutes.filter((a) =>
          a.L_activite.toLowerCase().includes(val.toLowerCase())
        );
        setListeActivites(filtered);
        const scored = toutes
          .map((a) => ({
            text: a.L_activite,
            score: similarityScore(val, a.L_activite),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((x) => x.text);
        setSuggestionsIA(scored);
        const exist = filtered.some(
          (a) => a.L_activite.toLowerCase() === val.toLowerCase()
        );
        setEstValide(exist || (valideIA === val));
      } catch (err) {
        console.error("Erreur suggestions :", err);
      }
    }, 300);
  };

  // ========================
  // DEMARRER ACTIVITE
  // ========================
  const demarrerActivite = async (L_activite: string) => {
    setIsLoading(true);
    let activiteObj = listeActivites.find(
      (a) => a.L_activite.toLowerCase() === L_activite.toLowerCase()
    );
    if (!activiteObj && valideIA === L_activite) {
      const toutes = await getAllActivites();
      const match = toutes.find((a) => a.L_activite === L_activite);
      if (match) activiteObj = match;
      else activiteObj = { Id_activite: "temp_" + Date.now(), L_activite };
    }
    if (!activiteObj) {
      setMessage("❌ Activité non reconnue.");
      setIsLoading(false);
      return;
    }
    try {
      await addLog({
        Num_matricule,
        Id_activite: activiteObj.Id_activite,
        Date_activite: new Date().toISOString(),
        Duree: duree,
      });
      setMessage(`Activité "${L_activite}" enregistré avec succès!`);
      setNouvelleActivite("");
      setDuree(30);
      setValideIA(null);
      await handleFetch();
      setTimeout(() => navigate("/tableaudebord"), 1500);
    } catch (err) {
      console.error("Erreur :", err);
      setMessage("Erreur lors de l'ajout dans la base locale");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estValide) return;
    demarrerActivite(nouvelleActivite);
  };

  // ========================
  // RENDU
  // ========================
  return (
    <Box
      sx={{
        p: 3,
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Titre animé */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "#2d3748",
            mb: 3,
            fontWeight: 700,
          }}
        >
          Accueil
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "#4a5568",
            mb: 4,
          }}
        >
          Bonjour, <strong>{Prenom}</strong>
        </Typography>
      </motion.div>

      {/* Message */}
      {message && (
        <Typography
          color={message.includes("❌") ? "error" : "primary"}
          textAlign="center"
          sx={{ mb: 2 }}
        >
          {message}
        </Typography>
      )}

      {/* Formulaire */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Activité effectuée"
              placeholder="Entrer une activité"
              value={nouvelleActivite}
              onChange={afficherActivite}
              error={!estValide}
              helperText={!estValide ? "Activité non reconnue" : ""}
              InputLabelProps={{ shrink: true }}
              autoComplete="off"
              sx={{ mb: 1 }}
            />
            {/* Suggestions IA */}
            {suggestionsIA.length > 0 && (
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🔍 Suggestions :
                </Typography>
                <Stack spacing={1}>
                  {suggestionsIA.map((s, i) => (
                    <Button
                      key={i}
                      variant="text"
                      size="small"
                      onClick={() => {
                        setNouvelleActivite(s);
                        setValideIA(s);
                        setEstValide(true);
                        setSuggestionsIA([]);
                      }}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {s}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            )}
            {/* Durée */}
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              Durée :
            </Typography>
            <RadioGroup
              row
              value={duree}
              onChange={(e) => setDuree(Number(e.target.value))}
              sx={{ justifyContent: "space-between", mb: 2 }}
            >
              {dureesOptions.map((d) => (
                <FormControlLabel
                  key={d}
                  value={d}
                  control={<Radio />}
                  label={`${d} min`}
                />
              ))}
            </RadioGroup>
            {/* Bouton Soumettre */}
            <Button
              type="submit"
              variant="contained"
              disabled={!estValide || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                background: "linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)",
                boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                "&:hover": {
                  background: "linear-gradient(45deg, #303f9f 30%, #1976d2 90%)",
                },
              }}
            >
              {isLoading ? "Chargement..." : "Soumettre"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Bouton afficher/masquer */}
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="outlined"
          onClick={() => setShowActivities((prev) => !prev)}
          sx={{
            borderColor: "#3f51b5",
            color: "#3f51b5",
            "&:hover": {
              borderColor: "#2196f3",
              color: "#2196f3",
            },
          }}
        >
          {showActivities ? "Masquer activités" : "Voir activités"}
        </Button>
      </Stack>

      {/* Tableau des activités */}
      <AnimatePresence>
        {showActivities && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={listAnimation}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                color: "#2d3748",
                mb: 2,
                fontWeight: 600,
              }}
            >
              Voici les 5 dernières activités effectuées
            </Typography>
            <TableContainer
              component={Paper}
              elevation={3}
              sx={{ borderRadius: 2, overflow: "hidden" }}
            >
              <Table>
                <TableHead sx={{ background: "linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)" }}>
                  <TableRow>
                    {["Activité", "Date", "Durée"].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activites.length > 0 ? (
                    activites.map((act, i) => (
                      <motion.tr
                        key={i}
                        variants={listAnimation}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout
                      >
                        <TableCell sx={{ textAlign: "center" }}>{act.L_activite}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {new Date(act.Date_activite).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{act.Duree} min</TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: "center", color: "#718096" }}>
                        Aucune activité enregistrée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Accueil;
