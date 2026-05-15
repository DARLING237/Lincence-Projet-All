-- Ajouter last_seen pour le suivi en ligne
ALTER TABLE utilisateurs ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
