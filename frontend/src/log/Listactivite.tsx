import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initDB } from "../db";
import jsPDF from "jspdf";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface LogActivite {
  Id_logs: number;
  Num_matricule: string;
  Id_activite: string;
  L_activite: string;
  Date_activite: string;
  Duree: number;
}

interface Employe {
  Num_matricule: string;
  Nom: string;
  Prenom: string;
  C_direction: string;
  C_service: string;
  C_departement: string;
  C_bureau: string;
}

interface Activite {
  Id_activite: string;
  L_activite: string;
  C_activite:string;
}

const Listactivite: React.FC = () => {
  // États inchangés
  const [db, setDb] = useState<any>(null);
  const [activites, setActivites] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [typeRecherche, setTypeRecherche] = useState<"jour" | "mois" | "annee">("jour");
  const [page, setPage] = useState<number>(0);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailDestinataire, setEmailDestinataire] = useState("");
  const [fileType, setFileType] = useState<"csv" | "pdf">("csv");
  const [fileToSend, setFileToSend] = useState<Blob | null>(null);
  const Num_matricule = localStorage.getItem("Num_matricule") || "";

  // Animations
  const listAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const modalAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  // Fonctions utilitaires (inchangées)
  const formatDuree = (duree: string | number | null) => {
    if (duree === null || duree === undefined) return "-";
    if (typeof duree === "string" && duree.includes(":")) return duree;
    const dureeNum = Number(duree);
    if (isNaN(dureeNum)) return "-";
    return `${Math.floor(dureeNum)}`;
  };

  const formatDateFR = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const extractPeriode = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${year}`;
};

/*const extractDay = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return String(d.getDate()).padStart(2, "0");
};
*/

  // Fonctions de gestion des données (inchangées)
  const handleFetch = async () => {
    if (!db) return;
    try {
      const logs: LogActivite[] = await db.getAll("logsactivite");
      const employes: Employe[] = await db.getAll("employe");
      const activitesRef: Activite[] = await db.getAll("activite");
      const logsFiltre = logs.filter(
        (log) => String(log.Num_matricule) === String(Num_matricule)
      );
      const tmpActivites = logsFiltre.map((log) => {
        const emp = employes.find((e) => e.Num_matricule === log.Num_matricule);
        const act = activitesRef.find(
          (a) => String(a.Id_activite) === String(log.Id_activite)
        );
        return {
          NUM_MATRICULE: emp?.Num_matricule || log.Num_matricule || "-",
          NOM: emp?.Nom || "-",
          PRENOM: emp?.Prenom || "-",
          C_DIRECTION: emp?.C_direction || "-",
           C_DEPARTEMENT: emp?.C_departement || "-",
          C_SERVICE: emp?.C_service || "-",
          ID_ACTIVITE: log.Id_activite || "-",
          CODE_ACTIVITE: act?.C_activite || "-",
          L_ACTIVITE: act?.L_activite || log.L_activite || "-",
          DUREE_MINUTES: log.Duree,
          DATE: log.Date_activite,
        };
      });
      let filtered = tmpActivites;
      if (date) {
        const dateOnly = (iso: string) => iso.slice(0, 10);
        if (typeRecherche === "jour")
          filtered = tmpActivites.filter((a) => dateOnly(a.DATE) === date);
        else if (typeRecherche === "mois")
          filtered = tmpActivites.filter((a) => dateOnly(a.DATE).slice(0, 7) === date);
        else if (typeRecherche === "annee")
          filtered = tmpActivites.filter((a) => dateOnly(a.DATE).slice(0, 4) === date);
      }
      if (filtered.length === 0) setMessage("Aucune activité à afficher.");
      else setMessage("");
      setActivites(
        filtered.sort((a, b) => new Date(b.DATE).getTime() - new Date(a.DATE).getTime())
      );
      setPage(0);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la récupération des activités.");
    }
  };

  const exportCSV = () => {
    if (activites.length === 0) return;
    const headers = [
      "Matricule",
      "Direction",
      "Departement",
      "Service",
      "Id_activité",
      "Code_activité",
      "Temps (min)",
      "Période",
      "Date"
    ];
    const rows = activites.map(a => [
      a.NUM_MATRICULE,
      a.C_DIRECTION,
      a.C_DEPARTEMENT,
      a.C_SERVICE,
      a.ID_ACTIVITE,
      a.CODE_ACTIVITE,
      formatDuree(a.DUREE_MINUTES),
      extractPeriode(a.DATE),
      formatDateFR(a.DATE)
    ]);
    const csvContent =
      headers.join(";") + "\n" +
      rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activites.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (activites.length === 0) return;
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(16);
    doc.text("Liste des Activités", 14, 20);
    doc.setFontSize(12);
    let y = 30;
    const lineHeight = 8;
    const headers = ["Matricule", "Direction", "Departement", "Service", "Id_activite", "Code_activite", "Temps (min)", "Periode", "Date"];
    doc.setFont("helvetica", "bold");
    let x = 14;
    headers.forEach((h) => { doc.text(h, x, y); x += 33; });
    y += lineHeight;
    doc.setFont("helvetica", "normal");
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = activites.slice(startIndex, endIndex);
    currentPageData.forEach((a) => {
      x = 14;
      [a.NUM_MATRICULE, a.C_DIRECTION, a.C_DEPARTEMENT, a.C_SERVICE, a.ID_ACTIVITE,a.CODE_ACTIVITE,formatDuree(a.DUREE_MINUTES), extractPeriode(a.DATE), formatDateFR(a.DATE)].forEach(val => {
        doc.text(String(val), x, y);
        x += 33;
      });
      y += lineHeight;
      if (y > 180) { doc.addPage(); y = 20; }
    });
    doc.save("activites.pdf");
  };

  const prepareFile = (type: "csv" | "pdf") => {
    let blob: Blob;
    if (type === "csv") {
      const headers = [
        "Matricule",
        "Direction",
        "Departement",
        "Service",
        "Id_activite",
        "Code_activite",
        "Temps (min)",
        "Periode",
        "Date"
      ];
      const rows = activites.map(a => [
        a.NUM_MATRICULE,
        a.C_DIRECTION,
        a.C_DEPARTEMENT,
        a.C_SERVICE,
        a.ID_ACTIVITE,
        a.CODE_ACTIVITE,
        formatDuree(a.DUREE_MINUTES),
        extractPeriode(a.DATE),
       formatDateFR(a.DATE)
      ]);
      const csvContent =
        headers.join(";") + "\n" +
        rows.map(r => r.join(";")).join("\n");
      blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    } else {
      const doc = new jsPDF("l", "mm", "a4");
      doc.setFontSize(16);
      doc.text("Liste des Activités", 14, 20);
      doc.setFontSize(12);
      let y = 30;
      const lineHeight = 8;
      const headers = ["Matricule", "Direction", "Departement", "Service", "Id_activite", "Code_activite", "Temps (min)", "Periode", "Date"];
      doc.setFont("helvetica", "bold");
      let x = 14;
      headers.forEach((h) => { doc.text(h, x, y); x += 33; });
      y += lineHeight;
      doc.setFont("helvetica", "normal");
      activites.forEach((a) => {
        x = 14;
        [a.NUM_MATRICULE, a.C_DIRECTION, a.C_DEPARTEMENT, a.C_SERVICE, a.ID_ACTIVITE, formatDuree(a.DUREE_MINUTES), extractPeriode(a.DATE), formatDateFR(a.DATE)].forEach(val => {
          doc.text(String(val), x, y);
          x += 33;
        });
        y += lineHeight;
        if (y > 180) { doc.addPage(); y = 20; }
      });
      const pdfArrayBuffer = doc.output("arraybuffer");
      blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
    }
    setFileType(type);
    setFileToSend(blob);
  };

  const openEmailModal = (type: "csv" | "pdf") => {
    if (activites.length === 0) return alert("Aucune activité à envoyer !");
    prepareFile(type);
    setTimeout(() => setIsModalOpen(true), 50);
  };

  // Initialisation
  useEffect(() => {
    const init = async () => {
      const dbInstance = await initDB();
      setDb(dbInstance);
      await handleFetch();
    };
    init();
  }, []);

  // Pagination
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = activites.slice(startIndex, endIndex);

  // Rendu
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
          Liste des Activités
        </Typography>
      </motion.div>

      {/* Filtres */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeRecherche}
              onChange={(e) => {
                setTypeRecherche(e.target.value as "jour" | "mois" | "annee");
                setDate("");
              }}
              label="Type"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="jour">Par jour</MenuItem>
              <MenuItem value="mois">Par mois</MenuItem>
              <MenuItem value="annee">Par année</MenuItem>
            </Select>
          </FormControl>

          {typeRecherche === "jour" && (
            <TextField
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          )}
          {typeRecherche === "mois" && (
            <TextField
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          )}
          {typeRecherche === "annee" && (
            <TextField
              type="number"
              placeholder="Ex: 2025"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
              sx={{ minWidth: 150 }}
            />
          )}

          <Button
            variant="contained"
            onClick={handleFetch}
            startIcon={<SearchIcon />}
            sx={{
              background: "linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)",
              boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #303f9f 30%, #1976d2 90%)",
              },
            }}
          >
            Rechercher
          </Button>
        </Stack>
      </Paper>

      {/* Message d'erreur */}
      {message && (
        <Typography color="error" textAlign="center" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      {/* Boutons d'export */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        mb={3}
        flexWrap="wrap"
      >
        <Button
          variant="contained"
          onClick={exportCSV}
          startIcon={<FileDownloadIcon />}
          sx={{
            backgroundColor: "#4caf50",
            "&:hover": { backgroundColor: "#388e3c" },
          }}
        >
          Exporter Excel
        </Button>
        <Button
          variant="contained"
          onClick={exportPDF}
          startIcon={<FileDownloadIcon />}
          sx={{
            backgroundColor: "#f44336",
            "&:hover": { backgroundColor: "#d32f2f" },
          }}
        >
          Exporter PDF
        </Button>
        <Button
          variant="contained"
          onClick={() => openEmailModal("csv")}
          startIcon={<EmailIcon />}
          sx={{
            backgroundColor: "#ff9800",
            "&:hover": { backgroundColor: "#f57c00" },
          }}
        >
          Envoyer Email
        </Button>
      </Stack>

      {/* Tableau des activités */}
      {currentPageData.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table>
            <TableHead sx={{ background: "linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)" }}>
              <TableRow>
                {["Numéro matricule", "Nom", "Prénom", "Activité", "Date", "Durée (min)"].map(
                  (header) => (
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
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageData.map((a, idx) => (
                <motion.tr
                  key={idx}
                  variants={listAnimation}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <TableCell sx={{ textAlign: "center" }}>{a.NUM_MATRICULE}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{a.NOM}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{a.PRENOM}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{a.L_ACTIVITE}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{formatDateFR(a.DATE)}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{formatDuree(a.DUREE_MINUTES)}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {activites.length > itemsPerPage && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          mt={3}
        >
          <Button
            variant="outlined"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            startIcon={<ArrowBackIcon />}
          >
            Précédent
          </Button>
          <Typography sx={{ alignSelf: "center" }}>
            Page {page + 1} / {Math.ceil(activites.length / itemsPerPage)}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setPage(page + 1)}
            disabled={endIndex >= activites.length}
            startIcon={<ArrowForwardIcon />}
          >
            Suivant
          </Button>
        </Stack>
      )}

      {/* Modal Email */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalAnimation}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 400,
            background: "#fff",
            boxShadow: "0px 3px 24px rgba(0,0,0,0.2)",
            padding: 32,
            borderRadius: 16,
          }}
        >
          <IconButton
            onClick={() => setIsModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" textAlign="center" mb={2}>
            Envoyer par Email
          </Typography>
          <TextField
            fullWidth
            label="Destinataire"
            type="email"
            value={emailDestinataire}
            onChange={(e) => setEmailDestinataire(e.target.value)}
            autoFocus
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as "csv" | "pdf")}
              label="Format"
            >
              <MenuItem value="csv">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (!emailDestinataire || !fileToSend) {
                  return alert("Email ou fichier manquant !");
                }
                try {
                  const firstActivite = currentPageData[0];
                  const Nom = firstActivite?.NOM || "Nom";
                  const Prenom = firstActivite?.PRENOM || "Prénom";
                  const Date_activite = date
                    ? typeRecherche === "jour"
                      ? formatDateFR(date)
                      : date
                    : "toutes";
                  const formData = new FormData();
                  formData.append("to", emailDestinataire);
                  formData.append("subject", "Liste des activités");
                  formData.append(
                    "message",
                    `Bonjour,\n\nVeuillez trouver ci-joint la liste des activités de ${Nom} ${Prenom},\n\nPériode: ${Date_activite}.`
                  );
                  const fileName =
                    fileType === "csv"
                      ? `activites_${Nom}_${Prenom}_${Date_activite}.csv`
                      : `activites_${Nom}_${Prenom}_${Date_activite}.pdf`;
                  formData.append("file", fileToSend, fileName);
                  const res = await fetch("http://localhost:4000/send-email", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Email envoyé avec succès !");
                    setIsModalOpen(false);
                    setEmailDestinataire("");
                  } else {
                    alert("Erreur : " + data.error);
                  }
                } catch (err) {
                  console.error(err);
                  alert("Erreur lors de l'envoi de l'email.");
                }
              }}
              sx={{
                background: "linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)",
                "&:hover": {
                  background: "linear-gradient(45deg, #303f9f 30%, #1976d2 90%)",
                },
              }}
            >
              Envoyer
            </Button>
          </Stack>
        </motion.div>
      </Modal>
    </Box>
  );
};

export default Listactivite;
