-- ======================================================
-- BarResto - Schéma complet de la base de données
-- Engine: InnoDB, Charset: utf8mb4
-- ======================================================

DROP DATABASE IF EXISTS `barrestaurant_db`;
CREATE DATABASE IF NOT EXISTS `barrestaurant_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `barrestaurant_db`;

-- ======================================================
-- 1. UTILISATEURS
-- ======================================================
CREATE TABLE `utilisateurs` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `nom`             VARCHAR(100)    NOT NULL,
  `prenom`          VARCHAR(100)    NOT NULL,
  `email`           VARCHAR(255)    NOT NULL UNIQUE,
  `mot_de_passe`    VARCHAR(255)    NOT NULL,
  `role`            ENUM('admin','manager','serveur','barman','caissier','cuisinier') NOT NULL DEFAULT 'serveur',
  `poste`           VARCHAR(100)    DEFAULT NULL,
  `telephone`       VARCHAR(20)     DEFAULT NULL,
  `date_embauche`   DATE            DEFAULT NULL,
  `avatar`          VARCHAR(500)    DEFAULT NULL,
  `actif`           BOOLEAN         NOT NULL DEFAULT TRUE,
  `first_login`     BOOLEAN         NOT NULL DEFAULT FALSE,
  `last_seen`       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_role (`role`),
  INDEX idx_actif (`actif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 2. CATEGORIES (pour le menu)
-- ======================================================
CREATE TABLE `categories` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `nom`             VARCHAR(100)    NOT NULL UNIQUE,
  `type_poste`      ENUM('bar','cuisine','tous') NOT NULL DEFAULT 'tous',
  `ordre_affiche`   INT             NOT NULL DEFAULT 999,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ordre (`ordre_affiche`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 3. PRODUITS MENU (cocktails, bières, softs, plats...)
-- ======================================================
CREATE TABLE `produits_menu` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `categorie_id`    INT             DEFAULT NULL,
  `nom`             VARCHAR(200)    NOT NULL,
  `description`     TEXT            DEFAULT NULL,
  `prix`            DECIMAL(10,0)   NOT NULL DEFAULT 0,
  `type_poste`      ENUM('bar','cuisine','tous') NOT NULL DEFAULT 'bar',
  `dispo`           BOOLEAN         NOT NULL DEFAULT TRUE,
  `bestseller`      BOOLEAN         NOT NULL DEFAULT FALSE,
  `photo`           VARCHAR(500)    DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categorie_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX idx_categorie (`categorie_id`),
  INDEX idx_type_poste (`type_poste`),
  INDEX idx_nom (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 4. TABLES SALLE
-- ======================================================
CREATE TABLE `tables_salle` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `numero`          VARCHAR(20)     NOT NULL UNIQUE,
  `places`          INT             NOT NULL DEFAULT 4,
  `zone`            VARCHAR(50)     DEFAULT NULL,
  `statut`          ENUM('libre','occupee','reservee') NOT NULL DEFAULT 'libre',
  `qr_actif`        BOOLEAN         NOT NULL DEFAULT FALSE,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_statut (`statut`),
  INDEX idx_zone (`zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 5. COMMANDES
-- ======================================================
CREATE TABLE `commandes` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `table_id`        INT             DEFAULT NULL,
  `serveur_id`      INT             DEFAULT NULL,
  `total`           DECIMAL(12,0)   NOT NULL DEFAULT 0,
  `heure`           TIME            NOT NULL,
  `date`            DATE            NOT NULL,
  `statut`          ENUM('en attente','en preparation','servie','payee','annulee') NOT NULL DEFAULT 'en attente',
  `source`          VARCHAR(50)     DEFAULT 'staff',
  `note`            TEXT            DEFAULT NULL,
  `mode_paiement`   ENUM('especes','orange_money','mtn_momo','carte','transfert') DEFAULT NULL,
  `est_differee`    BOOLEAN         NOT NULL DEFAULT FALSE,
  `date_prevue`     DATE            DEFAULT NULL,
  `heure_prevue`    TIME            DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`table_id`)   REFERENCES `tables_salle`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`serveur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL,
  INDEX idx_statut (`statut`),
  INDEX idx_date (`date`),
  INDEX idx_table (`table_id`),
  INDEX idx_serveur (`serveur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 6. COMMANDE ITEMS (lignes de commande)
-- ======================================================
CREATE TABLE `commande_items` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `commande_id`     INT             NOT NULL,
  `produit_menu_id` INT             NOT NULL,
  `quantite`        INT             NOT NULL DEFAULT 1,
  `prix_unitaire`   DECIMAL(10,0)   NOT NULL DEFAULT 0,
  `type_poste`      VARCHAR(20)     NOT NULL DEFAULT 'bar',
  `statut`          ENUM('en attente','en preparation','pret','annule','servi') NOT NULL DEFAULT 'en attente',
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`commande_id`)     REFERENCES `commandes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`produit_menu_id`) REFERENCES `produits_menu`(`id`) ON DELETE CASCADE,
  INDEX idx_commande (`commande_id`),
  INDEX idx_produit (`produit_menu_id`),
  INDEX idx_statut (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 7. STOCK PRODUITS (matières premières)
-- ======================================================
CREATE TABLE `produits_stock` (
  `id`                INT AUTO_INCREMENT PRIMARY KEY,
  `nom`               VARCHAR(200)    NOT NULL,
  `unite`             VARCHAR(50)     NOT NULL DEFAULT 'L',
  `stock_actuel`      DECIMAL(12,2)   NOT NULL DEFAULT 0,
  `stock_min`         DECIMAL(12,2)   NOT NULL DEFAULT 0,
  `dernier_ravitaillement` DATE       DEFAULT NULL,
  `alerte`            BOOLEAN         NOT NULL DEFAULT FALSE,
  `created_at`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nom (`nom`),
  INDEX idx_alerte (`alerte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 8. FOURNISSEURS
-- ======================================================
CREATE TABLE `fournisseurs` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `nom`             VARCHAR(200)    NOT NULL,
  `contact`         VARCHAR(200)    DEFAULT NULL,
  `email`           VARCHAR(255)    DEFAULT NULL,
  `adresse`         TEXT            DEFAULT NULL,
  `type`            VARCHAR(100)    DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nom (`nom`),
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 9. RAVITAILLEMENTS
-- ======================================================
CREATE TABLE `ravitaillements` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `fournisseur_id`  INT             DEFAULT NULL,
  `date`            DATE            NOT NULL,
  `montant`         DECIMAL(12,0)   NOT NULL DEFAULT 0,
  `nb_facture`      VARCHAR(100)    DEFAULT NULL,
  `photo_facture`   VARCHAR(500)    DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs`(`id`) ON DELETE SET NULL,
  INDEX idx_fournisseur (`fournisseur_id`),
  INDEX idx_date (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 10. RAVITAILLEMENT DETAILS
-- ======================================================
CREATE TABLE `ravitaillement_details` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `ravitaillement_id`   INT NOT NULL,
  `produit_stock_id`    INT NOT NULL,
  `quantite`            DECIMAL(12,2)  NOT NULL DEFAULT 0,
  `prix`                DECIMAL(12,0)  DEFAULT 0,
  FOREIGN KEY (`ravitaillement_id`) REFERENCES `ravitaillements`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`produit_stock_id`)  REFERENCES `produits_stock`(`id`) ON DELETE CASCADE,
  INDEX idx_ravitaillement (`ravitaillement_id`),
  INDEX idx_produit_stock (`produit_stock_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 11. MOUVEMENTS STOCK
-- ======================================================
CREATE TABLE `mouvements_stock` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `produit_stock_id`    INT             NOT NULL,
  `type`                ENUM('entree','sortie','retour','destruction') NOT NULL DEFAULT 'entree',
  `quantite`            DECIMAL(12,2)   NOT NULL DEFAULT 0,
  `raison`              VARCHAR(255)    DEFAULT NULL,
  `reference_id`        INT             DEFAULT NULL,
  `reference_type`      VARCHAR(50)     DEFAULT NULL,
  `date`                TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`produit_stock_id`) REFERENCES `produits_stock`(`id`) ON DELETE CASCADE,
  INDEX idx_produit (`produit_stock_id`),
  INDEX idx_date (`date`),
  INDEX idx_reference (`reference_id`, `reference_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 12. TRANSACTIONS FINANCIÈRES
-- ======================================================
CREATE TABLE `transactions` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `type_op`         ENUM('entree','sortie') NOT NULL,
  `categorie`       VARCHAR(100)    NOT NULL,
  `montant`         DECIMAL(12,0)   NOT NULL DEFAULT 0,
  `reference`       VARCHAR(100)    DEFAULT NULL,
  `description`     TEXT            DEFAULT NULL,
  `date`            DATE            NOT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (`type_op`),
  INDEX idx_date (`date`),
  INDEX idx_categorie (`categorie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 13. IMPÔTS & TAXES
-- ======================================================
CREATE TABLE `impots_taxes` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `libelle`         VARCHAR(200)    NOT NULL,
  `montant`         DECIMAL(12,0)   NOT NULL DEFAULT 0,
  `echeance`        DATE            NOT NULL,
  `statut`          ENUM('impaye','paye') NOT NULL DEFAULT 'impaye',
  `date_paiement`   DATE            DEFAULT NULL,
  `created_at`      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_echeance (`echeance`),
  INDEX idx_statut (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 14. SALAIRES
-- ======================================================
CREATE TABLE `salaires` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `personnel_id`        INT             NOT NULL,
  `mois_annee`          VARCHAR(7)      NOT NULL COMMENT 'Format: YYYY-MM',
  `montant`             DECIMAL(12,0)   NOT NULL DEFAULT 0,
  `statut`              ENUM('en attente','paye','partiel') NOT NULL DEFAULT 'en attente',
  `date_generation`     DATE            NOT NULL,
  `date_paiement`       DATE            DEFAULT NULL,
  `created_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`personnel_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE,
  UNIQUE KEY uq_personnel_mois (`personnel_id`, `mois_annee`),
  INDEX idx_mois_annee (`mois_annee`),
  INDEX idx_statut (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 15. PAIEMENTS
-- ======================================================
CREATE TABLE `paiements` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `commande_id`         INT             NOT NULL,
  `mode_paiement`       ENUM('especes','orange_money','mtn_momo','carte','transfert') NOT NULL,
  `montant`             BIGINT          NOT NULL DEFAULT 0,
  `reference`           VARCHAR(60)     DEFAULT NULL,
  `statut`              ENUM('complete','partielle','remboursee') NOT NULL DEFAULT 'complete',
  `date_paiement`       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `num_client`          VARCHAR(15)     DEFAULT NULL,
  `campay_reference`    VARCHAR(100)    DEFAULT NULL,
  `campay_status`       VARCHAR(20)     DEFAULT NULL,
  `campay_operator`     VARCHAR(20)     DEFAULT NULL,
  FOREIGN KEY (`commande_id`) REFERENCES `commandes`(`id`) ON DELETE CASCADE,
  INDEX idx_commande (`commande_id`),
  INDEX idx_mode_paiement (`mode_paiement`),
  INDEX idx_campay_ref (`campay_reference`),
  INDEX idx_date (`date_paiement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 16. CAMPAY SOLDE
-- ======================================================
CREATE TABLE `campay_solde` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `total_balance`       BIGINT          NOT NULL DEFAULT 0,
  `orange_balance`      BIGINT          NOT NULL DEFAULT 0,
  `mtn_balance`         BIGINT          NOT NULL DEFAULT 0,
  `currency`            VARCHAR(10)     NOT NULL DEFAULT 'XAF',
  `derniere_sync`       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `campay_solde` (id, total_balance, orange_balance, mtn_balance) VALUES (1, 0, 0, 0);

-- ======================================================
-- 17. INVENTAIRES
-- ======================================================
CREATE TABLE `inventaires` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `produit_stock_id`    INT             NOT NULL,
  `stock_theorique`     DECIMAL(12,2)   NOT NULL DEFAULT 0,
  `stock_reel`          DECIMAL(12,2)   NOT NULL DEFAULT 0,
  `ecart`               DECIMAL(12,2)   DEFAULT 0,
  `manageur_id`         INT             DEFAULT NULL,
  `note`                TEXT            DEFAULT NULL,
  `date_inventaire`     DATE            NOT NULL DEFAULT (CURRENT_DATE),
  `created_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`produit_stock_id`) REFERENCES `produits_stock`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`manageur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL,
  INDEX idx_date (`date_inventaire`),
  INDEX idx_produit (`produit_stock_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 18. PRÉSENCES (suivi des connexions)
-- ======================================================
CREATE TABLE `presences` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `personnel_id`        INT             NOT NULL,
  `date_connexion`      TIMESTAMP       DEFAULT NULL,
  `heure_connexion`     TIME            DEFAULT NULL,
  `date_deconnexion`    TIMESTAMP       DEFAULT NULL,
  `heure_deconnexion`   TIME            DEFAULT NULL,
  `date`                DATE            NOT NULL,
  `statut`              ENUM('present','absent','conge','retard','session_active') NOT NULL DEFAULT 'present',
  `ip_address`          VARCHAR(45)     DEFAULT NULL,
  `session_id`          VARCHAR(255)    DEFAULT NULL,
  `duree_session`       INT             DEFAULT NULL COMMENT 'Durée en secondes',
  `created_at`          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`personnel_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE,
  INDEX idx_personnel (`personnel_id`),
  INDEX idx_session_id (`session_id`),
  INDEX idx_personnel_date (`personnel_id`, `date`),
  INDEX idx_date (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- 19. HISTORIQUE ACTIONS (audit log dans la BD)
-- ======================================================
CREATE TABLE `historique_actions` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `utilisateur_id`  INT             DEFAULT NULL,
  `action`          VARCHAR(100)    NOT NULL,
  `ressource`       VARCHAR(100)    DEFAULT NULL,
  `ressource_id`    INT             DEFAULT NULL,
  `details`         TEXT            DEFAULT NULL,
  `ip_address`      VARCHAR(45)     DEFAULT NULL,
  `date`            TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL,
  INDEX idx_utilisateur (`utilisateur_id`),
  INDEX idx_action (`action`),
  INDEX idx_date (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- DONNÉES PAR DÉFAUT
-- ======================================================

-- Catégories par défaut
INSERT INTO `categories` (`nom`, `type_poste`, `ordre_affiche`) VALUES
  ('Cocktails',       'bar',      10),
  ('Bières',          'bar',      20),
  ('Softs',           'bar',      30),
  ('Wines & Spirits', 'bar',      40),
  ('Plats',           'cuisine',  50),
  ('Desserts',        'cuisine',  60),
  ('Autres',          'tous',     999);

-- Admin par défaut (mot de passe: admin123)
-- ⚠️ À CHANGER IMMÉDIATEMENT EN PRODUCTION
INSERT INTO `utilisateurs` (`nom`, `prenom`, `email`, `mot_de_passe`, `role`, `poste`, `actif`)
VALUES (
  'Admin',
  'BarResto',
  'admin@barresto.com',
  '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C',
  'admin',
  'Administrateur',
  TRUE
);

-- ======================================================
-- VUES UTILES
-- ======================================================

-- Vue: Commandes en cours avec détails
CREATE OR REPLACE VIEW `v_commandes_en_cours` AS
SELECT
  c.*,
  t.numero   AS table_nom,
  t.numero   AS table_numero,
  u.prenom   AS serveur,
  u.prenom   AS serveur_prenom,
  u.nom      AS serveur_nom
FROM `commandes` c
LEFT JOIN `tables_salle` t ON c.table_id = t.id
LEFT JOIN `utilisateurs` u ON c.serveur_id = u.id
WHERE c.statut IN ('en attente', 'en preparation', 'servie');

-- Vue: Chiffre d'affaires mensuel
CREATE OR REPLACE VIEW `v_ca_mensuel` AS
SELECT
  DATE_FORMAT(`date`, '%Y-%m')  AS periode,
  DATE_FORMAT(`date`, '%b %Y')  AS periode_label,
  COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0)  AS ca,
  COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0)  AS depenses,
  COALESCE(SUM(CASE WHEN type_op = 'entree' THEN montant ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type_op = 'sortie' THEN montant ELSE 0 END), 0)  AS benefice
FROM `transactions`
WHERE `date` IS NOT NULL
GROUP BY DATE_FORMAT(`date`, '%Y-%m')
ORDER BY periode DESC;