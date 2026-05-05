# ⚖️ Avocat-Link — Plateforme Juridique Client-Avocat

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://projet-si-final.vercel.app/)
[![Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)

**Avocat-Link** est un extranet métier full-stack connectant les clients recherchant une assistance juridique avec des avocats spécialisés. La plateforme permet la publication de dossiers, la gestion des candidatures, la prise de rendez-vous consultatifs, la messagerie instantanée et le dépôt sécurisé de preuves.

📌 **Lien de production (Vercel)** : [https://projet-si-final.vercel.app/](https://projet-si-final.vercel.app/)  
📂 **Dépôt GitHub** : [https://github.com/MalakMakes/projet-si-final](https://github.com/MalakMakes/projet-si-final)

👥 **Binôme** :  
- AZIL Malak  
- BENDANA Nourhane  
- KADI Mounia  

🎓 **Projet de Fin de Module – Architecture Cloud & Vibe Programming**  
*Date de rendu : 10/05/2026 | Pondération : 40% de la note finale*

---

## 📋 Table des matières

1. [Mapping du thème](#-mapping-du-thème)
2. [Analyse d'architecture](#-analyse-darchitecture)
3. [Fonctionnalités clés](#-fonctionnalités-clés)
4. [Stack technologique](#-stack-technologique)
5. [Schéma base de données & RLS](#-schéma-base-de-données--rls)
6. [Instructions d'installation](#-instructions-dinstallation)
7. [Identifiants de test](#-identifiants-de-test)

---

## 🗂 Mapping du thème

**Thème choisi : #8 – Juridique ("Avocat-Link")**

| Élément imposé | Implémentation dans Avocat‑Link | Description |
|----------------|----------------------------------|-------------|
| **Table A (Utilisateurs)** | `profiles` (via `auth.users`) | Clients et avocats. La colonne `role` distingue `client` de `avocat`. |
| **Table B (Ressources)** | `cases` (dossiers juridiques) | Dossiers publiés par les clients. Consultables par les avocats pour postuler. |
| **Table C (Interactions)** | `applications` (candidatures) | Relie un avocat (Table A) à un dossier (Table B). Contient message et statut. |
| **Fichier (Storage)** | Bucket `case-documents` | Preuves, contrats, PDF déposés par le client lors de la création du dossier. |

> ✅ **Note** : Les fonctionnalités additionnelles (chat en temps réel, rendez-vous, gestion des statuts) enrichissent l'expérience sans remplacer la structure imposée des trois tables.

---

## 🏗 Analyse d'architecture

### 1. Pourquoi Vercel + Supabase est financièrement plus logique qu'un serveur classique (OPEX / CAPEX) ?

Un déploiement sur serveur physique impliquerait des **dépenses d'investissement (CAPEX)** importantes :
- Achat du matériel (serveurs, unités de rack)
- Système de climatisation
- Logiciels et licences
- Coûts d'installation et de câblage

**Avec Vercel + Supabase**, le modèle passe entièrement en **dépenses opérationnelles (OPEX)** :
- Pas d'achat matériel
- Facturation à l'usage
- Démarrage à **coût zéro**
- Les coûts augmentent *proportionnellement à l'adoption réelle*

> **Pour Avocat-Link** : lancer ce projet sur un serveur dédié reviendrait à payer des mois de capacité inutilisée. Sur le cloud serverless, nous ne payons que lorsque des clients postent des dossiers ou que des avocats consultent les annonces.

### 2. Comment Vercel gère-t-il la scalabilité par rapport à un datacenter physique ?

| Aspect | Datacenter physique | Vercel (serverless + CDN) |
|--------|---------------------|----------------------------|
| **Capacité maximale** | Limite fixe (nombre de racks) | Illimitée élastique |
| **Temps de montée en charge** | Semaines (installation) | Millisecondes (auto-scaling) |
| **Coûts au ralenti** | Élevés (climatisation, maintenance) | Nuls ou très faibles |
| **Disponibilité mondiale** | Complexe et coûteuse | Incluse (CDN mondial) |

### 3. Qu'est-ce qui représente la donnée structurée et non‑structurée dans Avocat‑Link ?

- **Donnée structurée** : Toute information stockée dans PostgreSQL (titre, description, statut, rôle, dates). Ces données ont un schéma fixe et sont interrogables en SQL.

- **Donnée non‑structurée** : Les fichiers stockés dans Supabase Storage (preuves, contrats scannés, photos). Ce sont des objets binaires sans structure interne exploitable par la base de données.

---

## ✨ Fonctionnalités clés

### 🔄 Écosystème à double rôle
- **Clients** : publient des dossiers, consultent les candidatures, choisissent un avocat, valident des rendez-vous
- **Avocats** : postulent aux dossiers ouverts, gèrent leurs candidatures, proposent des consultations

### 📁 Gestion complète des dossiers
- Publication avec titre, description et fichiers joints
- Flux dynamique : `Ouvert → Clôturé → Terminé`

### 💬 Communication en temps réel
- Chat instantané avec **Supabase Realtime**

### 📅 Système de rendez-vous
- Proposition et confirmation de créneaux

### 🔐 Sécurité RLS
- Isolation totale des données entre utilisateurs

---

## 🛠 Stack technologique

| Couche | Technologie(s) |
|--------|----------------|
| **Frontend** | Next.js 14 (TypeScript) |
| **Styling** | Tailwind CSS, Shadcn UI |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Hébergement** | Vercel (CI/CD automatique) |

---

## 🗄 Schéma base de données & RLS

### Structure des tables

-- Table A : Utilisateurs --
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT,
  role        TEXT CHECK (role IN ('client', 'avocat'))
);

-- Table B : Dossiers juridiques --
CREATE TABLE cases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES profiles(id),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT DEFAULT 'open'
);

-- Table C : Candidatures --
CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID REFERENCES cases(id),
  avocat_id   UUID REFERENCES profiles(id),
  status      TEXT DEFAULT 'pending'
);

Politiques RLS (Critère éliminatoire)
sql
-- Un client ne voit que SES dossiers
CREATE POLICY "client_own_cases" ON cases
  FOR ALL USING (auth.uid() = client_id);

-- Un avocat ne voit que SES candidatures
CREATE POLICY "avocat_own_applications" ON applications
  FOR ALL USING (auth.uid() = avocat_id);

## ⚙️ Instructions d'installation
bash
1. Cloner le dépôt
git clone https://github.com/MalakMakes/projet-si-final.git
cd projet-si-final

2. Installer les dépendances
npm install

3. Configurer .env.local
NEXT_PUBLIC_SUPABASE_URL=votre-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé

4. Lancer en local
npm run dev

## 🔐 Identifiants de test

| Rôle | Adresse e-mail | Mot de passe |
|------|----------------|---------------|
| **Client** | `test_client@gmail.com` | `testtest` |
| **Avocat** | `test_avocat@gmail.com` | `testtest` |
