Ce projet a été crée dans le but de collecter les activités des personnels d'une entreperise 
Le projet **DTI** est une application complète comprenant :

- Un **backend Node.js**
- Un **frontend React**
- Une application **Electron** (pour la version desktop)
- Une structure modulaire permettant de gérer des fonctionnalités avancées

Ce dépôt contient tout le code source du projet, à l’exception des dépendances (`node_modules`), qui peuvent être restaurées avec `npm install`.
Dans le dossier racine, un concurrently a été configurer via le Package.json permettant de tout lancer via la commande "npm run dev" 
Voici la structure du projet dans son ensemble: 
DTI/
│── backend/
│ ├── src/
│ ├── package.json
│ └── node_modules/ (ignoré)
│
│── frontend/
│ ├── src/
│ ├── package.json
│ └── node_modules/ (ignoré)
│
│── electron/
│ ├── main.js
│ ├── package.json
│ └── node_modules/ (ignoré)
│
│── node_modules/ (ignoré)
│── README.md
│── .gitignore
│── Package.json
