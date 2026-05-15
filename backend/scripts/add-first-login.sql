-- Ajouter la colonne first_login pour le flux de changement de mot de passe
-- Exécuter : mysql -u root barrelle_db < backend/scripts/add-first-login.sql

ALTER TABLE utilisateurs ADD COLUMN first_login BOOLEAN DEFAULT FALSE;

-- Pour les employés déjà existants, marquer first_login = FALSE (ils ont déjà utilisé leur compte)
UPDATE utilisateurs SET first_login = FALSE WHERE first_login IS NULL;
