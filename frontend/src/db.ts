// db.jsimport { openDB } from "idb";

import { openDB } from "idb";
// ======== Initialisation de la base IndexedDB ========
export async function initDB() {
  const db = await openDB("GestionActivite", 6, {
    upgrade(db) {
      // Table employe
      if (!db.objectStoreNames.contains("employe")) {
        const store = db.createObjectStore("employe", { keyPath: "Num_matricule" });
        store.createIndex("Nom", "Nom");
        store.createIndex("Prenom", "Prenom");
        store.createIndex("Pseudo", "Pseudo", { unique: true });
        store.createIndex("Mdp", "Mdp");
        store.createIndex("Num_cin", "Num_cin");
      }

      // Table activite
      if (!db.objectStoreNames.contains("activite")) {
        const store = db.createObjectStore("activite", { keyPath: "Id_activite" });
        store.createIndex("L_activite", "L_activite", { unique: true });
        store.createIndex("C_activite", "C_activite");
        store.createIndex("Id_process", "Id_process");
        store.createIndex("Niveau_activite", "Niveau_activite");
        store.createIndex("C_activite_mere", "C_activite_mere");
        store.createIndex("Code_process", "Code_process");
      }

      // Table logsactivite
      if (!db.objectStoreNames.contains("logsactivite")) {
        const store = db.createObjectStore("logsactivite", { keyPath: "Id_logs", autoIncrement: true });
        store.createIndex("Num_matricule", "Num_matricule");
        store.createIndex("Id_activite", "Id_activite");
        store.createIndex("Duree", "Duree");
        store.createIndex("Date_activite", "Date_activite");
      }

      // Table settings
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    },
  });

  return db;
}

export async function openDBConnection() {
  return await initDB();
}

// ======== SETTINGS ========
export async function setSetting(key: string, value: any) {
  const db = await openDBConnection();
  const tx = db.transaction("settings", "readwrite");
  await tx.store.put({ key, value });
  await tx.done;
}

export async function getSetting(key: string) {
  const db = await openDBConnection();
  const tx = db.transaction("settings", "readonly");
  const setting = await tx.store.get(key);
  return setting ? setting.value : null;
}

// ======== EMPLOYE ========
export async function addEmploye(employe: any) {
  const db = await openDBConnection();
  const tx = db.transaction("employe", "readwrite");
  await tx.store.add(employe);
  await tx.done;
}

export async function getAllEmployes() {
  const db = await openDBConnection();
  return await db.getAll("employe");
}
export async function findEmployeByNumMatricule(Num_matricule:string) {
  const db = await openDBConnection();
  const tx = db.transaction("employe", "readonly");
  return await tx.store.get(Num_matricule);
}
export async function updateEmployePassword(Num_matricule: string, newMdp: any) {
  const db = await openDBConnection();
  const tx = db.transaction("employe", "readwrite");
  const employe = await tx.store.get(Num_matricule);
  if (!employe) throw new Error("Employé non trouvé");
  employe.Mdp = newMdp;
  await tx.store.put(employe);
  await tx.done;
}



// ======== ACTIVITE ========
export async function addActivite(activite: any) {
  const db = await openDBConnection();
  const tx = db.transaction("activite", "readwrite");
  await tx.store.add(activite);
  await tx.done;
}

export async function getActivitesSuggestions(searchTerm: string = ""): Promise<{Id_activite: string, L_activite: string}[]> {
  const db = await openDBConnection();
  const tx = db.transaction("activite", "readonly");
  const store = tx.objectStore("activite");
  const allActivities: {Id_activite: string, L_activite: string}[] = [];

  for await (const cursor of store.iterate()) {
    allActivities.push({ Id_activite: cursor.value.Id_activite, L_activite: cursor.value.L_activite });
  }

  const term = searchTerm.trim().toLowerCase();
  // Filtrer les activités qui contiennent le terme
  const filtered = term
    ? allActivities.filter(a => a.L_activite.toLowerCase().includes(term))
    : allActivities;

  return filtered;
}
export async function getAllActivites() {
  const db = await initDB();
  return await db.getAll("activite"); // toute la table
}



// ======== LOGS ACTIVITE ========
export async function addLog(log: {Num_matricule: string, Id_activite: string, Date_activite: string, Duree: number}) {
  const db = await openDBConnection();
  const tx = db.transaction("logsactivite", "readwrite");
  await tx.store.add(log);
  await tx.done;
}

export async function getLogsByEmploye(Num_matricule: string) {
  const db = await openDBConnection();
  const tx = db.transaction("logsactivite", "readonly");
  const index = tx.store.index("Num_matricule");
  return await index.getAll(Num_matricule);
}


export async function rechercheLogs(Num_matricule: string, date: string) {
  const logs = await getLogsByEmploye(Num_matricule);
  if (!date) return logs;

  const [year, month, day] = date.split("-").map(Number);

  return logs.filter((log: {Num_matricule: string, Id_activite: string, Date_activite: string, Duree: number}) => {
    const logDate = new Date(log.Date_activite);
    if (day) return logDate.getFullYear() === year && logDate.getMonth() + 1 === month && logDate.getDate() === day;
    if (month) return logDate.getFullYear() === year && logDate.getMonth() + 1 === month;
    return logDate.getFullYear() === year;
  });
}
