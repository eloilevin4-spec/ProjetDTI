import "dotenv/config";
import express from "express";
import oracledb from "oracledb";
import cors from "cors";
import bcrypt from "bcrypt";
const levenshtein = require('fast-levenshtein');
const app = express();
app.use(cors());
app.use(express.json());

let conn;
async function initdb(){
try{const db = await oracledb.getConnection({
    user:  process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECT 
});
console.log("Connexion réussi✅");
return db;
}catch(err){
    console.error("Echec de la connexion ❌:", err)
}

}

//Pour employe
//✅login
app.post("/employe/login", async (req,res)=>{
    const {Num_matricule,Mdp}=req.body;
    const result = await conn.execute("SELECT Num_matricule, Prenom, Mdp FROM Employe WHERE Pseudo=:1 ",[Num_matricule]);
    if(result.rows.length > 0){
        const mdpbd = result.rows[0][2];
        /*const mdpcompare = await bcrypt.compare(Mdp, mdpbd);
        if(mdpcompare){
            res.json({Num_matricule:result.rows[0][0], Prenom:result.rows[0][1] });
            
        }
        else{
            res.status(401).json({error: "Mot de passe incorrect"});
        }*/
       if (Mdp === mdpbd) {
              res.json({ Num_matricule: result.rows[0][0], Prenom: result.rows[0][1] });
        } else {
              res.status(401).json({ error: "Mot de passe incorrect" });
        }

      
    }else{
      res.status(401).json({error:"Pseudo incorrect"});
    }
});
//✅vérifier l'activité en cours
app.post("/activite/verifier", async (req,res)=>{
  const {Num_matricule}= req.body;
  const result = await conn.execute("SELECT LA.Id_log, A.L_activite, LA.Heure_debut FROM logsactivite LA JOIN activite A ON LA.Id_activite = A.Id_activite WHERE LA.Num_matricule = :1 AND LA.Est_active = 1",[Num_matricule]);
  if(result.rows.length > 0){
      res.json({Id_log: result.rows[0][0], L_activite: result.rows[0][1], Heure_debut: result.rows[0][2]}); 
  }else{
      res.status(404).json({error: "Aucune activité en cours"});
  }
});

//✅Mot de passe oublié
app.post("/employe/motdepasseoublie", async (req,res)=>{
const {Num_cin,Newmdp,Num_matricule}= req.body;
const result = await conn.execute("SELECT Num_cin FROM Employe WHERE Num_matricule=:1",[Num_matricule]);
if(result.rows.length > 0){
    const numcinbd = result.rows[0][0];
    if(numcinbd !== Num_cin){
        return res.status(401).json({error: "Numéro de CIN incorrect"});
    }
    else{const result2 = await conn.execute("UPDATE Employe SET Mdp = :1 WHERE Num_cin = :2",[Newmdp,numcinbd],{autoCommit : true});
    if(result2.rowsAffected > 0){
        res.json({message: "Mot de passe mis à jour avec succès"});
    }else{
        res.status(500).json({error: "Echec de la mise à jour du mot de passe"});
    }} 
    
}else{
    res.status(404).json({error: "Pseudo non trouvé"});
} 
});
//✅Démarrer une activité
app.post("/activite/demarrer",async (req,res)=>{
  const {Num_matricule, L_activite,Duree}=req.body;
  const verification = await conn.execute("SELECT * FROM activite WHERE L_activite LIKE '%' || :1 || '%'",[L_activite]);
  if(verification.rows.length > 0){
    const verification1 = await conn.execute(
  "SELECT Id_activite FROM activite WHERE L_activite LIKE '%' || :1 || '%'",
  [L_activite]
);
 const Id_activite = verification1.rows[0][0];
    const result3 = await conn.execute("INSERT INTO logsactivite(Num_matricule, Id_activite, Date_activite, Duree) VALUES(:1,:2,SYSTIMESTAMP,:3)",[Num_matricule, Id_activite, Duree], {autoCommit : true});
   
    if(result3.rowsAffected > 0 ){
      res.status(201).json({message: "activité relancée et log crée avec succès",  L_activite : L_activite});
    
    }else{
      res.status(500).json({error:"Echec de la relance de l'activité"});
    } 
  } else {
    //algorithme de reconnaissance approximative
  }
});
//✅Arrêter une activité
//✅Arrêter une activité (version corrigée)
/*app.post("/activite/stop", async (req, res) => {
  try {
    const { Num_matricule, L_activite } = req.body;

    // Étape 1 : récupérer le log actif exact à arrêter
    const verification = await conn.execute(
      `SELECT LA.Id_log
       FROM logsactivite LA
       JOIN activite A ON LA.Id_activite = A.Id_activite
       WHERE LA.Num_matricule = :1
         AND LA.Est_active = 1
         AND A.L_activite = :2`,
      [Num_matricule, L_activite]
    );

    if (verification.rows.length === 0) {
      return res.status(404).json({ error: "Aucune activité en cours à arrêter" });
    }

    const idLog = verification.rows[0][0];

    // Étape 2 : mettre à jour le log exact
    const result = await conn.execute(
      `UPDATE logsactivite
       SET Est_active = 0,
           Heure_fin = SYSTIMESTAMP,
           Duree_minutes = 
             EXTRACT(DAY FROM (SYSTIMESTAMP - Heure_debut)) * 24 * 60 +
             EXTRACT(HOUR FROM (SYSTIMESTAMP - Heure_debut)) * 60 +
             EXTRACT(MINUTE FROM (SYSTIMESTAMP - Heure_debut)) +
             EXTRACT(SECOND FROM (SYSTIMESTAMP - Heure_debut)) / 60
       WHERE Id_log = :1`,
      [idLog],
      { autoCommit: true }
    );

    if (result.rowsAffected > 0) {
      res.status(201).json({
        message: "Activité arrêtée et log mis à jour avec succès",
        L_activite
      });
    } else {
      res.status(500).json({ error: "Échec de l'arrêt de l'activité" });
    }

  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});*/


  //✅reprendre une activité mise en pause
/*app.post("/activite/reprendre", async (req, res) => {
  const { Num_matricule, L_activite } = req.body;

  // Vérifier si l'activité existe et est en pause
  const verif = await conn.execute(
    `SELECT Id_log 
     FROM logsactivite 
     WHERE Num_matricule = :1 
       AND Id_activite = (SELECT Id_activite FROM activite WHERE L_activite = :2)
       AND Est_active = 0
     ORDER BY Id_log DESC FETCH FIRST 1 ROWS ONLY`,
    [Num_matricule, L_activite]
  );

  if (verif.rows.length === 0) {
    return res.status(404).json({ error: "Aucune activité mise en pause trouvée pour ce matricule" });
  }

  const idLog = verif.rows[0][0];

  
  const result = await conn.execute(
    `INSERT INTO logsactivite (Num_matricule, Id_activite, Est_active, Heure_debut)
     SELECT :1, Id_activite, 1, SYSTIMESTAMP
     FROM activite WHERE L_activite = :2`,
    [Num_matricule, L_activite],
    { autoCommit: true }
  );

  if (result.rowsAffected > 0) {
    res.status(201).json({
      message: "Activité reprise avec succès",
      L_activite
    });
  } else {
    res.status(500).json({ error: "Échec de la reprise de l'activité" });
  }
});*/

/*  //✅mettre en pause une activité
app.post("/activite/pause", async (req, res) => {
  const { Num_matricule, L_activite } = req.body;

  const result = await conn.execute(
    `UPDATE logsactivite 
     SET 
       Heure_fin = SYSTIMESTAMP,
       Duree_minutes = 
         EXTRACT(DAY FROM (SYSTIMESTAMP - Heure_debut)) * 24 * 60 +
         EXTRACT(HOUR FROM (SYSTIMESTAMP - Heure_debut)) * 60 +
         EXTRACT(MINUTE FROM (SYSTIMESTAMP - Heure_debut)) +
         EXTRACT(SECOND FROM (SYSTIMESTAMP - Heure_debut)) / 60,
       Est_active = 0
     WHERE Num_matricule = :1
       AND Id_activite = (SELECT Id_activite FROM activite WHERE L_activite = :2)
       AND Est_active = 1
       AND Heure_fin IS NULL`,
    [Num_matricule, L_activite],
    { autoCommit: true }
  );

  if (result.rowsAffected > 0) {
    res.status(201).json({
      message: "Activité mise en pause et log mis à jour avec succès",
      L_activite: L_activite
    });
  } else {
    res.status(500).json({ error: "Échec de la mise en pause de l'activité" });
  }
});*/


  //✅afficher les 5 dernières activités de l'employé
app.get("/activite/derniere/:id", async (req, res) => {
  try {
    const Num_matricule = req.params.id;

    const result = await conn.execute(
      `SELECT L_activite
FROM (
    SELECT 
        A.L_activite,
        ROW_NUMBER() OVER (PARTITION BY A.L_activite ORDER BY LA.Id_log DESC) AS rn
    FROM logsactivite LA
    JOIN activite A ON LA.Id_activite = A.Id_activite
    WHERE LA.Num_matricule = :1
)
WHERE rn = 1
ORDER BY ROWNUM ASC
FETCH FIRST 5 ROWS ONLY
`,
      [Num_matricule]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});


//✅pour afficher la liste des activités par search bar
// endpoint corrigé
app.get("/activite/list", async (req, res) => {
  try {
    const { L_activite } = req.query;
    const searchTerm = (L_activite || "").toLowerCase();

    // 1️⃣ Récupérer toutes les activités pour faire un filtre intelligent
    const result = await conn.execute(
      `SELECT L_activite 
       FROM activite`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const allActivities = result.rows.map(row => (row.L_ACTIVITE || row.L_activite).toLowerCase());

    // 2️⃣ Filtrer les activités selon proximité avec le texte tapé
    let filteredActivities = allActivities.filter(a => a.includes(searchTerm));

    // 3️⃣ Si aucun résultat exact, proposer les plus proches
    if (filteredActivities.length === 0 && searchTerm) {
      // Calculer la distance de Levenshtein
      const distances = allActivities.map(a => ({
        activity: a,
        distance: levenshtein.get(a, searchTerm)
      }));

      // Trier par distance croissante et ne garder que les 5 meilleures suggestions
      distances.sort((x, y) => x.distance - y.distance);
      filteredActivities = distances.slice(0, 5).map(d => d.activity);
    }

    res.json(filteredActivities);

  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});



//Pour administrateur
app.post("/employe/creationadmin", async (req,res)=>{
   
    const {Num_matricule, Pseudo, Mdp, Prenom, Nom, Est_admin}= req.body;
   await conn.execute("INSERT INTO utilisateur(Num_matricule, Pseudo, Mdp, Prenom, Nom, Est_admin) VALUES(:1,:2,:3,:4,:5,:6)",
    [Num_matricule, Pseudo, Mdp, Prenom, Nom, Est_admin]
   ,{autoCommit : true});
   res.json({Num_matricule, Pseudo, Mdp, Prenom, Nom, Est_admin});

});


//✅
app.get("/activite/affichage", async (req, res) => { 
    try {
        const result = await conn.execute(
            "SELECT * FROM ACTIVITE",
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // clé pour un JSON clair
        );
        res.json({ result: result.rows }); // ne renvoie que les lignes
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});


//✅
app.get("/employe/affichage", async (req,res)=>{
    try {
        const result = await conn.execute("SELECT * FROM employe");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err);
    }
});
//
app.put("/activite/modification/:id", async (req,res)=>{
  const {activite_id} = req.params.id;
  const {nom_activite}= req.body;
  const result = await conn.execute("UPDATE activite SET L_activite = :1 WHERE Id_activite = :2", [nom_activite,activite_id], {autoCommit : true});
  if (result.rowsAffected == 1 ){
    res.status(201).json({message: "activite modifié avec succès", Id_activite:activite_id,L_activite: nom_activite,  })
  }else{
    res.status(500).json({error:"échec de la modification de l'activite"});
  }
});
//
app.delete("/activite/supression/:id", async (req, res)=>{
  const {activite_id}= req.params.id;
   const result = await conn.execute("DELETE FROM activite WHERE Id_activite = :1", [activite_id], {autoCommit : true});
   if (result.rowsAffected > 0) {
     res.status(201).json({message:"Succès de la supression d'activité"});
   } else {
     res.status(404).json({error:"Aucune activité trouvée à supprimer"});
   }
   res.status(201).json({message:"Succès de la supression d'activité"});
})

//✅Recherche des logs d'activité par employé et par date
app.get("/logsactivite/recherche/:id", async (req, res) => {
  try {
    const { id } = req.params;          // Numéro matricule
    const { date } = req.query;         // ex: ?date=2025-11-04, ou ?date=2025-11, ou ?date=2025

    let query = `
      SELECT 
        E.Num_matricule,
        E.Nom,
        E.Prenom,
        A.L_activite,
       TO_CHAR(LA.Date_activite, 'DD-MM-YYYY') AS Date_activite,
       LA.Duree
      FROM logsactivite LA
      JOIN employe E ON LA.Num_matricule = E.Num_matricule
      JOIN activite A ON LA.Id_activite = A.Id_activite
      WHERE E.Num_matricule = :1
    `;

    const params = [id];

    // 🔎 Gestion du filtre date (jour / mois / année)
    if (date && date.trim() !== "") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        query += " AND TRUNC(LA.Date_activite) = TO_DATE(:2, 'YYYY-MM-DD')";
        params.push(date);
      } else if (/^\d{4}-\d{2}$/.test(date)) {
        query += " AND TO_CHAR(LA.Date_activite, 'YYYY-MM') = :2";
        params.push(date);
      } else if (/^\d{4}$/.test(date)) {
        query += " AND TO_CHAR(LA.Date_activite, 'YYYY') = :2";
        params.push(date);
      } else {
        return res.status(400).json({ error: "Format de date invalide. Utilisez YYYY, YYYY-MM ou YYYY-MM-DD." });
      }
    }

    query += " ORDER BY LA.Date_activite DESC, LA.Heure_debut DESC";

    const result = await conn.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucune activité trouvée." });
    }

    res.json(result.rows);

  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

conn = await initdb();
app.listen(5100, ()=>console.log('le serveur a démarrer sur le port 5100😊'));

