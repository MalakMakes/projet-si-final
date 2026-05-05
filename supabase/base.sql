-- TABLE A : Les Utilisateurs (Le "Qui")
CREATE TABLE profils (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nom_complet text,
  email text,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE B : Les Ressources (Le "Quoi")
CREATE TABLE ressources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titre text NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE C : Les Interactions (Le "Lien")
CREATE TABLE interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profil_id uuid REFERENCES profils(id),
  ressource_id uuid REFERENCES ressources(id),
  date_action timestamp with time zone DEFAULT now(),
  statut text DEFAULT 'en_attente',
  fichier_joint_url text -- Pour le PDF, l'image, ou le doc demandé
);