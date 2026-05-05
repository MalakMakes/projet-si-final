# Avocat-Link ⚖️

Bienvenue sur le dépôt du projet de fin de module "Architecture Cloud & Vibe Programming"

---

## 1. Mapping du Thème

Notre projet est basé sur le thème juridique "Avocat-Link" (Thème #8 de la roulette). L'architecture est modélisée comme suit :

* **Table A (Utilisateurs) :** Gérée via `Supabase Auth`, différenciant les profils Clients et Avocats.
* **Table B (Ressources) :** Représente les avocats / dossiers disponibles.
* **Table C (Interactions) :** Table reliant les clients et les avocats pour les consultations.
* **Fichiers (Storage) :** Permet l'upload du dossier de preuve et des documents juridiques.

---

## 2. Analyse d'Architecture

### Analyse OPEX / CAPEX
L'utilisation de **Vercel** et **Supabase** est financièrement plus logique pour lancer ce projet car elle réduit à zéro les coûts matériels. Les dépenses d'investissement initiales (CAPEX) sont inexistantes, et le projet ne repose que sur des coûts opérationnels basés sur l'usage réel (OPEX).

### Scalabilité et Gestion des Ressources
Contrairement à un serveur physique local qui nécessite un système de climatisation et des racks matériels, Vercel gère automatiquement et de manière élastique la montée en charge, permettant une scalabilité mondiale sans nécessiter d'intervention sur l'infrastructure physique.

### Typologie des Données
* **Donnée Structurée :** Les informations stockées dans la base de données relationnelle PostgreSQL, telles que les descriptions, statuts et titres des cas.
* **Donnée Non-structurée :** Les documents, preuves et pièces jointes enregistrés dans les buckets de stockage Supabase.

---

## 3. Fonctionnalités de la Plateforme

### Dual-Role Ecosystem
* La plateforme est conçue avec une architecture orientée rôles, permettant une séparation claire entre les **Clients** (chercheurs d'assistance) et les **Avocats** (professionnels).

### Case Management System (Dossiers)
* **Création de cas :** Les clients peuvent publier des dossiers et attacher des fichiers via le stockage Supabase.
* **Opportunités et Postulations :** Les avocats peuvent parcourir les cas disponibles et postuler avec un message personnalisé.
* **Cycle de vie :** Le statut du dossier évolue dynamiquement (Ouvert, Clôturé, Terminé).

### Integrated Appointment System & Real-time Communication
* **Prise de rendez-vous (RDV) :** Les avocats proposent des consultations, et les clients peuvent valider ou gérer leurs rendez-vous.
* **Chat en temps réel :** Communications instantanées intégrées pour chaque dossier.

### Sécurité et Performance
* **Protection RLS :** Row Level Security configurée pour empêcher l'accès non autorisé aux dossiers des autres utilisateurs.
* **Design Professionnel :** Interface moderne, intégrant une palette premium ("Italian Roast").
