-- Script de migration pour ajouter le suivi des connexions à la table presences
-- Exécuter après avoir mis à jour le schéma dans database.sql

ALTER TABLE presences
ADD COLUMN IF NOT EXISTS date_connexion TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS heure_connexion TIME NULL,
ADD COLUMN IF NOT EXISTS date_deconnexion TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS heure_deconnexion TIME NULL,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) NULL,
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS duree_session INT NULL COMMENT 'Durée en secondes';

-- Mettre à jour le schéma pour la contrainte ENUM
ALTER TABLE presences
MODIFY COLUMN statut ENUM('present','absent','conge','retard','session_active') DEFAULT 'present';

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_presences_session_id ON presences(session_id);
CREATE INDEX IF NOT EXISTS idx_presences_personnel_date ON presences(personnel_id, date);