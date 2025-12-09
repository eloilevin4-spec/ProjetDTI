// NotificationProvider.tsx
import React, { createContext, useEffect, useRef, useState } from "react";
import { getSetting } from "../db";
import { useLocation } from "react-router-dom";

interface NotificationContextProps {}

export const NotificationContext = createContext<NotificationContextProps>({});

interface Props {
  children: React.ReactNode;
  allowedPaths: string[];
}

export const NotificationProvider: React.FC<Props> = ({ children, allowedPaths }) => {
  const notifIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const [notifMinute, setNotifMinute] = useState<number>(1);

  // Converssion "HH:MM" en minutes
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  
  const isWithinWorkInterval = (
    now: Date,
    debutTravail: string,
    finTravail: string,
    debutPause?: string,
    finPause?: string
  ) => {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const dt = toMinutes(debutTravail);
    const ft = toMinutes(finTravail);
    const dp = debutPause ? toMinutes(debutPause) : -1;
    const fp = finPause ? toMinutes(finPause) : -1;

    const beforePause = dp !== -1 ? nowMin >= dt && nowMin < dp : nowMin >= dt && nowMin < ft;
    const afterPause = fp !== -1 ? nowMin >= fp && nowMin < ft : false;

    return beforePause || afterPause;
  };

  
  const loadNotifMinute = async () => {
    const val = await getSetting("notifMinute");
    if (val) {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) setNotifMinute(n);
    }
  };

  
  const startInterval = async () => {
    if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);

    await loadNotifMinute(); 
    notifIntervalRef.current = setInterval(async () => {
      const now = new Date();
      const debutTravail = await getSetting("debutTravail");
      const finTravail = await getSetting("finTravail");
      const debutPause = await getSetting("debutPause");
      const finPause = await getSetting("finPause");

      if (!debutTravail || !finTravail) return;

      if (
        allowedPaths.includes(location.pathname) &&
        isWithinWorkInterval(now, debutTravail, finTravail, debutPause, finPause)
      ) {
        
        window.electronAPI?.sendNotification(
          "⏰ Rappel",
          "Voulez -vous enregistrer votre activité actuelle ?"
        );
      }
    }, notifMinute * 60 * 1000);
  };

  
  useEffect(() => {
    startInterval();
    return () => {
      if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    };
  }, [location.pathname, notifMinute]); 

  
  useEffect(() => {
    const intervalCheck = setInterval(async () => {
      const val = await getSetting("notifMinute");
      const n = val ? parseInt(val, 10) : notifMinute;
      if (!isNaN(n) && n > 0 && n !== notifMinute) {
        setNotifMinute(n); 
      }
    }, 5000);

    return () => clearInterval(intervalCheck);
  }, [notifMinute]);

  return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>;
};
