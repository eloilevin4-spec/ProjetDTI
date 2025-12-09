import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ScriptableContext,
  Filler
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import { openDBConnection } from "../db";
import {
  Box,
  Typography,
  Paper,
  Card,
  Avatar,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";

// Enregistrement des composants ChartJS nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Activite {
  Id_activite: string;
  L_activite: string;
}

interface LogActivite {
  Id_logs: number;
  Num_matricule: string;
  Id_activite: string;
  Date_activite: string;
  Duree: number;
}

// Palette de couleurs modernes 2025
const modernColors = {
  primary: "#6366f1",
  secondary: "#10b981",
  indigo: "#4f46e5",
  cyan: "#06b6d4",
  pink: "#ec4899",
  teal: "#14b8a6",
  amber: "#f59e0b",
  gradient1: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  gradient2: "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
  gradient3: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
};

// Animations pour les graphiques avec le bon typage
const chartVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const Tableaudebord: React.FC = () => {
  const [totalEmployes, setTotalEmployes] = useState<number>(0);
  const [totalActivites, setTotalActivites] = useState<number>(0);
  const [labels, setLabels] = useState<string[]>([]);
  const [dataValues, setDataValues] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBarChart, setShowBarChart] = useState<boolean>(false);
  const [showPieChart, setShowPieChart] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const db = await openDBConnection();
      const employes = await db.getAll("employe");
      const activites: Activite[] = await db.getAll("activite");
      const logs: LogActivite[] = await db.getAll("logsactivite");

      setTotalEmployes(employes.length);
      setTotalActivites(activites.length);

      const mapActivite = new Map<string, Set<string>>();
      logs.forEach((log) => {
        if (!mapActivite.has(log.Id_activite)) mapActivite.set(log.Id_activite, new Set());
        mapActivite.get(log.Id_activite)!.add(log.Num_matricule);
      });

      const sorted = Array.from(mapActivite.entries())
        .map(([id, employesSet]) => ({
          Id_activite: id,
          count: employesSet.size,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const chartLabels = sorted.map((s) => {
        const act = activites.find((a) => a.Id_activite === s.Id_activite);
        return act ? act.L_activite : s.Id_activite;
      });
      const chartData = sorted.map((s) => s.count);

      setLabels(chartLabels);
      setDataValues(chartData);
      setLoading(false);

      // Démarrer les animations après un court délai
      setTimeout(() => {
        setShowBarChart(true);
        setTimeout(() => {
          setShowPieChart(true);
        }, 300);
      }, 500);
    };
    fetchData();
  }, []);

  // Calcul du taux d'engagement avec vérification de type
  const engagementRate = (): string => {
    const sum = Array.isArray(dataValues) ?
      dataValues.reduce((acc: number, val: unknown) =>
        typeof val === 'number' ? acc + val : acc, 0) : 0;

    const total = typeof totalEmployes === 'number' ? totalEmployes : 0;
    const rate = total > 0 ? Math.min(100, Math.round((sum / total) * 100)) : 0;
    return `${rate}%`;
  };

  // Créer un dégradé pour les barres
  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: {top: number, bottom: number, left: number, right: number}) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "#6366f1");
    gradient.addColorStop(0.5, "#8b5cf6");
    gradient.addColorStop(1, "#a855f7");
    return gradient;
  };

  // Données pour l'histogramme avec style 2025
  const barData: ChartData<"bar", number[], string> = {
    labels: labels,
    datasets: [
      {
        label: "Nombre d'employés par activité",
        data: dataValues,
        backgroundColor: (context: ScriptableContext<"bar">) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return modernColors.indigo;
          }
          return getGradient(ctx, chartArea);
        },
        borderColor: modernColors.indigo,
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "#4338ca",
        hoverBorderWidth: 2,
        hoverBorderColor: modernColors.indigo,
        borderSkipped: false,
      },
    ],
  };

  // Options pour l'histogramme avec style 2025
  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 20,
        bottom: 10
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "ACTIVITÉS LES PLUS POPULAIRES",
        font: {
          size: 18,
          family: "'Inter', sans-serif",
        },
        color: "#1e293b",
        padding: {
          bottom: 25,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        padding: 12,
        displayColors: true,
        cornerRadius: 8,
        boxPadding: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} employés`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Nombre d'employés",
          color: "#6b7280",
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          padding: { bottom: 10 }
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6b7280",
          stepSize: 1,
          padding: 8,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        },
      },
      x: {
        title: {
          display: true,
          text: "Activités",
          color: "#6b7280",
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          padding: { top: 10 }
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          padding: 5,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          }
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    }
  };

  // Données pour le camembert avec style 2025
  const pieData: ChartData<"pie", number[], string> = {
    labels: labels,
    datasets: [
      {
        label: "Répartition",
        data: dataValues,
        backgroundColor: [
          modernColors.indigo, modernColors.pink, modernColors.teal,
          modernColors.amber, "#8b5cf6", modernColors.cyan,
          "#f97316", "#ef4444", modernColors.secondary, "#3b82f6",
        ],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 4,
      },
    ],
  };

  // Options pour le camembert avec style 2025
  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#1f2937",
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        },
      },
      title: {
        display: true,
        text: "RÉPARTITION DES ACTIVITÉS",
        font: {
          size: 18,
          family: "'Inter', sans-serif",
        },
        color: "#1f2937",
        padding: {
          bottom: 25,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        padding: 12,
        displayColors: true,
        cornerRadius: 8,
        boxPadding: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = typeof context.raw === 'number' ? context.raw : 0;
            const total = Array.isArray(context.dataset.data) ?
              context.dataset.data.reduce((a: number, b: unknown) =>
                typeof b === 'number' ? a + b : a, 0) : 0;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutBack'
    }
  };

  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      fontFamily: "'Inter', sans-serif",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Tableau de bord
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src="/path/to/avatar.jpg"
            alt="User Avatar"
            sx={{
              width: 32,
              height: 32,
              bgcolor: modernColors.primary,
              color: "white"
            }}
          />
        </Box>
      </Box>

      {/* Cartes de statistiques */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 3,
        mb: 5
      }}>
        {[
          {
            title: "Total employés",
            value: totalEmployes,
            icon: "👥",
            color: modernColors.indigo,
            bgColor: "rgba(79, 70, 229, 0.1)"
          },
          {
            title: "Total activités",
            value: totalActivites,
            icon: "📊",
            color: modernColors.amber,
            bgColor: "rgba(245, 158, 11, 0.1)"
          },
          {
            title: "Activités uniques",
            value: labels.length,
            icon: "⭐",
            color: modernColors.secondary,
            bgColor: "rgba(16, 185, 129, 0.1)"
          },
          {
            title: "Taux d'engagement",
            value: engagementRate(),
            icon: "👍",
            color: modernColors.cyan,
            bgColor: "rgba(6, 182, 212, 0.1)"
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              height: "100%",
              backgroundColor: item.bgColor,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: item.color }}>
                    {item.value}
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: `${item.color}20`,
                  color: item.color,
                  width: 40,
                  height: 40,
                  boxShadow: `0 2px 4px rgba(${item.color}, 0.1)`
                }}>
                  {item.icon}
                </Avatar>
              </Stack>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Section des graphiques */}
      <Typography variant="h6" sx={{
        fontWeight: 700,
        color: "#1e293b",
        mb: 3,
        pb: 1,
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)"
      }}>
        Statistiques des activités
      </Typography>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
        gap: 4,
        mb: 4
      }}>
        {/* Carte de l'histogramme avec animations */}
        <Card sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          background: "linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 1))"
        }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 700,
            color: modernColors.indigo,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              bgcolor: modernColors.indigo,
              borderRadius: "50%",
              boxShadow: `0 0 0 2px ${modernColors.indigo}33`
            }} />
            ACTIVITÉS POPULAIRES
          </Typography>

          <Box sx={{ height: 380, position: "relative" }}>
            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <CircularProgress size={24} sx={{ color: modernColors.indigo }} />
              </Stack>
            ) : (
              <AnimatePresence>
                {showBarChart && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <Bar data={barData} options={barOptions} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </Box>
        </Card>

        {/* Carte du camembert avec animations */}
        <Card sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          background: "linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 1))"
        }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 700,
            color: modernColors.cyan,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              bgcolor: modernColors.cyan,
              borderRadius: "50%",
              boxShadow: `0 0 0 2px ${modernColors.cyan}33`
            }} />
            RÉPARTITION DES ACTIVITÉS
          </Typography>

          <Box sx={{ height: 380, position: "relative" }}>
            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <CircularProgress size={24} sx={{ color: modernColors.cyan }} />
              </Stack>
            ) : (
              <AnimatePresence>
                {showPieChart && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <Pie data={pieData} options={pieOptions} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default Tableaudebord;
