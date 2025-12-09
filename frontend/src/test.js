import { getAllActivites, getActivitesFiltered } from "./db";

async function testDB() {
  try {
    console.log("==== Test getAllActivites ====");
    const all = await getAllActivites();
    console.log(all);

    console.log("==== Test getActivitesFiltered (mot clé: 'projet') ====");
    const filtered = await getActivitesFiltered("projet");
    console.log(filtered);

    console.log("==== Test getActivitesFiltered (mot clé inexistant) ====");
    const fuzzy = await getActivitesFiltered("inexistant");
    console.log(fuzzy);

  } catch (err) {
    console.error("Erreur test DB:", err);
  }
}

testDB();
