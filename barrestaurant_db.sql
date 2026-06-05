-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 04 juin 2026 à 01:27
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `barrestaurant_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `campay_solde`
--

DROP TABLE IF EXISTS `campay_solde`;
CREATE TABLE IF NOT EXISTS `campay_solde` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total_balance` bigint NOT NULL DEFAULT '0',
  `orange_balance` bigint NOT NULL DEFAULT '0',
  `mtn_balance` bigint NOT NULL DEFAULT '0',
  `currency` varchar(10) NOT NULL DEFAULT 'XAF',
  `derniere_sync` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `campay_solde`
--

INSERT INTO `campay_solde` (`id`, `total_balance`, `orange_balance`, `mtn_balance`, `currency`, `derniere_sync`) VALUES
(1, 0, 0, 0, 'XAF', '2026-05-17 16:40:08');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `type_poste` enum('cuisine','tous') NOT NULL DEFAULT 'tous',
  `ordre_affiche` int NOT NULL DEFAULT '999',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`),
  KEY `idx_ordre` (`ordre_affiche`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `nom`, `type_poste`, `ordre_affiche`, `created_at`) VALUES
(1, 'Entrées', 'cuisine', 10, '2026-05-15 13:39:21'),
(2, 'Plats principaux', 'cuisine', 20, '2026-05-15 13:39:21'),
(3, 'Desserts', 'cuisine', 30, '2026-05-15 13:39:21'),
(4, 'Boissons Restaurant', 'tous', 40, '2026-05-15 13:39:21'),
(5, 'Grillades', 'cuisine', 50, '2026-05-15 13:39:21');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
CREATE TABLE IF NOT EXISTS `commandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_id` int DEFAULT NULL,
  `serveur_id` int DEFAULT NULL,
  `total` decimal(12,0) NOT NULL DEFAULT '0',
  `heure` time NOT NULL,
  `date` date NOT NULL,
  `statut` enum('en attente','en preparation','servie','payee','annulee') NOT NULL DEFAULT 'en attente',
  `source` varchar(50) DEFAULT 'staff',
  `note` text,
  `mode_paiement` enum('especes','orange_money','mtn_momo','carte','transfert') DEFAULT NULL,
  `est_differee` tinyint(1) NOT NULL DEFAULT '0',
  `date_prevue` date DEFAULT NULL,
  `heure_prevue` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_statut` (`statut`),
  KEY `idx_date` (`date`),
  KEY `idx_table` (`table_id`),
  KEY `idx_serveur` (`serveur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `table_id`, `serveur_id`, `total`, `heure`, `date`, `statut`, `source`, `note`, `mode_paiement`, `est_differee`, `date_prevue`, `heure_prevue`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 7000, '12:30:00', '2026-05-15', 'payee', 'staff', NULL, 'especes', 0, NULL, NULL, '2026-05-15 14:28:13', '2026-05-15 14:28:13'),
(2, 3, 2, 17000, '13:00:00', '2026-05-15', 'servie', 'staff', NULL, NULL, 0, NULL, NULL, '2026-05-15 14:28:13', '2026-05-15 15:35:12'),
(3, 14, 2, 12000, '16:33:38', '2026-05-15', 'servie', 'qr_client', 'Commande table BALCON1', NULL, 0, NULL, NULL, '2026-05-15 15:33:38', '2026-05-15 15:33:47');

-- --------------------------------------------------------

--
-- Structure de la table `commande_items`
--

DROP TABLE IF EXISTS `commande_items`;
CREATE TABLE IF NOT EXISTS `commande_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commande_id` int NOT NULL,
  `produit_menu_id` int NOT NULL,
  `quantite` int NOT NULL DEFAULT '1',
  `prix_unitaire` decimal(10,0) NOT NULL DEFAULT '0',
  `type_poste` varchar(20) NOT NULL DEFAULT 'cuisine',
  `statut` enum('en attente','en preparation','pret','annule','servi') NOT NULL DEFAULT 'en attente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_commande` (`commande_id`),
  KEY `idx_produit` (`produit_menu_id`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `commande_items`
--

INSERT INTO `commande_items` (`id`, `commande_id`, `produit_menu_id`, `quantite`, `prix_unitaire`, `type_poste`, `statut`, `created_at`) VALUES
(1, 1, 1, 1, 4000, 'cuisine', 'servi', '2026-05-15 14:28:13'),
(2, 1, 3, 1, 1000, 'tous', 'servi', '2026-05-15 14:28:13'),
(3, 2, 5, 2, 8000, 'cuisine', 'en preparation', '2026-05-15 14:28:13'),
(4, 2, 4, 1, 1000, 'tous', 'pret', '2026-05-15 14:28:13'),
(5, 3, 20, 1, 12000, 'cuisine', 'servi', '2026-05-15 15:33:38');

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

DROP TABLE IF EXISTS `fournisseurs`;
CREATE TABLE IF NOT EXISTS `fournisseurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) NOT NULL,
  `contact` varchar(200) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `adresse` text,
  `type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nom` (`nom`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id`, `nom`, `contact`, `email`, `adresse`, `type`, `created_at`, `updated_at`) VALUES
(1, 'Société des Eaux et Boissons (SEB)', '699000000', 'contact@seb.cm', 'Douala, Cameroun', 'Boissons & Softs', '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(2, 'Boucherie Centrale de Yaoundé', '677000000', 'viande@boucherie.cm', 'Yaoundé, Marché Central', 'Viandes & Volailles', '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(3, 'Poissonnerie du Port de Douala', '688000000', 'peche@port.cm', 'Quai de Pêche, Douala', 'Poissons & Fruits de mer', '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(4, 'Marché Vivrier du Mfoundi', '655000000', 'frais@mfoundi.cm', 'Secteur vivrier, Yaoundé', 'Légumes, Épices & Fruits', '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(5, 'Grossiste Alimentaire SOCOPRAL', '699112233', 'info@socopral.cm', 'Zone Industrielle, Bassa', 'Produits Secs & Huiles', '2026-05-15 14:41:57', '2026-05-18 09:52:05');

-- --------------------------------------------------------

--
-- Structure de la table `historique_actions`
--

DROP TABLE IF EXISTS `historique_actions`;
CREATE TABLE IF NOT EXISTS `historique_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `ressource` varchar(100) DEFAULT NULL,
  `ressource_id` int DEFAULT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_utilisateur` (`utilisateur_id`),
  KEY `idx_action` (`action`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `impots_taxes`
--

DROP TABLE IF EXISTS `impots_taxes`;
CREATE TABLE IF NOT EXISTS `impots_taxes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(200) NOT NULL,
  `montant` decimal(12,0) NOT NULL DEFAULT '0',
  `echeance` date NOT NULL,
  `statut` enum('impaye','paye') NOT NULL DEFAULT 'impaye',
  `date_paiement` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_echeance` (`echeance`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `inventaires`
--

DROP TABLE IF EXISTS `inventaires`;
CREATE TABLE IF NOT EXISTS `inventaires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_stock_id` int NOT NULL,
  `stock_theorique` decimal(12,2) NOT NULL DEFAULT '0.00',
  `stock_reel` decimal(12,2) NOT NULL DEFAULT '0.00',
  `ecart` decimal(12,2) DEFAULT '0.00',
  `manageur_id` int DEFAULT NULL,
  `note` text,
  `date_inventaire` date NOT NULL DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `manageur_id` (`manageur_id`),
  KEY `idx_date` (`date_inventaire`),
  KEY `idx_produit` (`produit_stock_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mouvements_stock`
--

DROP TABLE IF EXISTS `mouvements_stock`;
CREATE TABLE IF NOT EXISTS `mouvements_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_stock_id` int NOT NULL,
  `type` enum('entree','sortie','retour','destruction') NOT NULL DEFAULT 'entree',
  `quantite` decimal(12,2) NOT NULL DEFAULT '0.00',
  `raison` varchar(255) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_produit` (`produit_stock_id`),
  KEY `idx_date` (`date`),
  KEY `idx_reference` (`reference_id`,`reference_type`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `mouvements_stock`
--

INSERT INTO `mouvements_stock` (`id`, `produit_stock_id`, `type`, `quantite`, `raison`, `reference_id`, `reference_type`, `date`) VALUES
(1, 5, 'sortie', 1.00, 'Commande produit_menu_id #5', 2, NULL, '2026-05-15 14:28:13'),
(2, 6, 'sortie', 0.50, 'Commande produit_menu_id #5', 2, NULL, '2026-05-15 14:28:13'),
(3, 17, 'sortie', 0.30, 'Commande produit_menu_id #5', 2, NULL, '2026-05-15 14:28:13'),
(4, 15, 'sortie', 1.00, 'Commande produit_menu_id #20', 3, NULL, '2026-05-15 15:33:38'),
(5, 6, 'sortie', 0.20, 'Commande produit_menu_id #20', 3, NULL, '2026-05-15 15:33:38');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
CREATE TABLE IF NOT EXISTS `paiements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commande_id` int NOT NULL,
  `mode_paiement` enum('especes','orange_money','mtn_momo','carte','transfert') NOT NULL,
  `montant` bigint NOT NULL DEFAULT '0',
  `reference` varchar(60) DEFAULT NULL,
  `statut` enum('complete','partielle','remboursee') NOT NULL DEFAULT 'complete',
  `date_paiement` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `num_client` varchar(15) DEFAULT NULL,
  `campay_reference` varchar(100) DEFAULT NULL,
  `campay_status` varchar(20) DEFAULT NULL,
  `campay_operator` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_commande` (`commande_id`),
  KEY `idx_mode_paiement` (`mode_paiement`),
  KEY `idx_campay_ref` (`campay_reference`),
  KEY `idx_date` (`date_paiement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `presences`
--

DROP TABLE IF EXISTS `presences`;
CREATE TABLE IF NOT EXISTS `presences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `personnel_id` int NOT NULL,
  `date_connexion` timestamp NULL DEFAULT NULL,
  `heure_connexion` time DEFAULT NULL,
  `date_deconnexion` timestamp NULL DEFAULT NULL,
  `heure_deconnexion` time DEFAULT NULL,
  `date` date NOT NULL,
  `statut` enum('present','absent','conge','retard','session_active') NOT NULL DEFAULT 'present',
  `ip_address` varchar(45) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `duree_session` int DEFAULT NULL COMMENT 'Durée en secondes',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_personnel` (`personnel_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_personnel_date` (`personnel_id`,`date`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produits_menu`
--

DROP TABLE IF EXISTS `produits_menu`;
CREATE TABLE IF NOT EXISTS `produits_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categorie_id` int DEFAULT NULL,
  `nom` varchar(200) NOT NULL,
  `description` text,
  `prix` decimal(10,0) NOT NULL DEFAULT '0',
  `type_poste` enum('cuisine','tous') NOT NULL DEFAULT 'cuisine',
  `dispo` tinyint(1) NOT NULL DEFAULT '1',
  `bestseller` tinyint(1) NOT NULL DEFAULT '0',
  `photo` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_categorie` (`categorie_id`),
  KEY `idx_type_poste` (`type_poste`),
  KEY `idx_nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits_menu`
--

INSERT INTO `produits_menu` (`id`, `categorie_id`, `nom`, `description`, `prix`, `type_poste`, `dispo`, `bestseller`, `photo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Salade Niçoise', 'Salade fraîcheur au thon, olives et oeuf dur', 4000, 'cuisine', 1, 1, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(2, 1, 'Bouillon de boeuf', 'Soupe épicée de boeuf locale parfumée', 3500, 'cuisine', 1, 0, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(3, 4, 'Coca-Cola', 'Boisson gazeuse rafraîchissante 33cl', 1000, 'tous', 1, 1, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(4, 4, 'Sprite', 'Boisson gazeuse citron-lime 33cl', 1000, 'tous', 1, 0, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(5, 2, 'Poulet DG', 'Poulet frit, plantains mûrs, poivrons et carottes', 8000, 'cuisine', 1, 1, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(6, 2, 'Ndole Viande', 'Ndole traditionnel avec viande de boeuf tendre', 7000, 'cuisine', 1, 0, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(7, 3, 'Crème brûlée', 'Dessert classique à la vanille de Penja caramélisée', 3000, 'cuisine', 1, 0, NULL, '2026-05-15 14:28:13', '2026-05-18 09:52:05'),
(15, 4, 'Eau Minérale', 'Bouteille d\'eau minérale plate 1.5L', 800, 'tous', 1, 1, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(16, 4, 'Jus d\'orange', 'Jus d\'orange frais pressé pressé minute', 1500, 'tous', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 10:00:35'),
(17, 4, 'Fanta', 'Boisson gazeuse à l\'orange 33cl', 1000, 'tous', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(18, 4, 'Jus de Bissap', 'Jus de bissap maison infusé à la menthe', 1000, 'tous', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(19, 4, 'Jus de Gingembre', 'Jus de gingembre frais fait maison', 1000, 'tous', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(20, 2, 'Poisson Braisé', 'Thiof braisé entier avec frites de plantain', 12000, 'cuisine', 1, 1, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(21, 2, 'Ero', 'Plat traditionnel à base de feuilles d\'ero et boeuf', 5000, 'cuisine', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(22, 3, 'Glace Vanille', '2 boules de glace vanille premium et coulis', 2500, 'cuisine', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(23, 5, 'Brochettes de filet', 'Brochettes de filet de boeuf grillées (la portion)', 6000, 'cuisine', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05'),
(24, 3, 'Dame-blanche', 'Glaces vanille avec chocolat chaud et chantilly', 2500, 'cuisine', 1, 0, NULL, '2026-05-15 14:41:57', '2026-05-18 09:52:05');

-- --------------------------------------------------------

--
-- Structure de la table `produits_stock`
--

DROP TABLE IF EXISTS `produits_stock`;
CREATE TABLE IF NOT EXISTS `produits_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) NOT NULL,
  `unite` varchar(50) NOT NULL DEFAULT 'Kg',
  `stock_actuel` decimal(12,2) NOT NULL DEFAULT '0.00',
  `stock_min` decimal(12,2) NOT NULL DEFAULT '0.00',
  `dernier_ravitaillement` date DEFAULT NULL,
  `alerte` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nom` (`nom`),
  KEY `idx_alerte` (`alerte`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits_stock`
--

INSERT INTO `produits_stock` (`id`, `nom`, `unite`, `stock_actuel`, `stock_min`, `dernier_ravitaillement`, `alerte`, `created_at`, `updated_at`) VALUES
(1, 'Oignons Blancs', 'Kg', 30.00, 10.00, '2026-05-14', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(2, 'Ail séché', 'Kg', 10.00, 2.00, '2026-05-14', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(3, 'Gingembre frais', 'Kg', 12.00, 3.00, '2026-05-14', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(4, 'Poivrons multicolores', 'Kg', 15.00, 3.00, '2026-05-14', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(5, 'Poulet entier (Frais)', 'Kg', 45.00, 10.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(6, 'Plantain Mûr (Regimes)', 'Regime', 12.00, 3.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(13, 'Crevettes roses', 'Kg', 20.00, 5.00, '2026-05-12', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(14, 'Beurre doux', 'Kg', 15.00, 4.00, '2026-05-12', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(15, 'Poisson Bar (Frais)', 'Kg', 35.00, 8.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(16, 'Filet de Boeuf', 'Kg', 28.00, 5.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(17, 'Tomates Fraîches', 'Kg', 50.00, 15.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(18, 'Carottes', 'Kg', 30.00, 10.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(20, 'Pommes de terre', 'Kg', 40.00, 10.00, '2026-05-12', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(21, 'Sac de Riz Parfumé (25kg)', 'Sac', 5.00, 1.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(22, 'Huile de Palme Raffinée', 'Litre', 40.00, 10.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(23, 'Feuilles d\'Ero (Séchées)', 'Kg', 15.00, 3.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(24, 'Thon en conserve (1kg)', 'Boite', 12.00, 3.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(25, 'Oeufs frais (Alvéoles)', 'Alveole', 10.00, 2.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(26, 'Crème fraîche liquide', 'Litre', 10.00, 2.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(27, 'Sel fin', 'Kg', 10.00, 2.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(28, 'Poivre moulu', 'Kg', 5.00, 1.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05'),
(29, 'Sucre en poudre', 'Kg', 20.00, 5.00, '2026-05-13', 0, '2026-05-18 09:52:05', '2026-05-18 09:52:05');

-- --------------------------------------------------------

--
-- Structure de la table `ravitaillements`
--

DROP TABLE IF EXISTS `ravitaillements`;
CREATE TABLE IF NOT EXISTS `ravitaillements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fournisseur_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `montant` decimal(12,0) NOT NULL DEFAULT '0',
  `nb_facture` varchar(100) DEFAULT NULL,
  `photo_facture` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fournisseur` (`fournisseur_id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ravitaillements`
--

INSERT INTO `ravitaillements` (`id`, `fournisseur_id`, `date`, `montant`, `nb_facture`, `photo_facture`, `created_at`) VALUES
(1, 1, '2026-05-14', 180000, 'FAC-SEB-099', NULL, '2026-05-15 14:28:14'),
(2, 2, '2026-05-14', 250000, 'FAC-BOUCH-012', NULL, '2026-05-15 14:29:46'),
(3, 3, '2026-05-15', 120000, 'FAC-PECHE-488', NULL, '2026-05-15 14:41:57'),
(4, 4, '2026-05-15', 75000, 'FAC-MFOUN-23', NULL, '2026-05-15 14:41:57');

-- --------------------------------------------------------

--
-- Structure de la table `ravitaillement_details`
--

DROP TABLE IF EXISTS `ravitaillement_details`;
CREATE TABLE IF NOT EXISTS `ravitaillement_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ravitaillement_id` int NOT NULL,
  `produit_stock_id` int NOT NULL,
  `quantite` decimal(12,2) NOT NULL DEFAULT '0.00',
  `prix` decimal(12,0) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_ravitaillement` (`ravitaillement_id`),
  KEY `idx_produit_stock` (`produit_stock_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ravitaillement_details`
--

INSERT INTO `ravitaillement_details` (`id`, `ravitaillement_id`, `produit_stock_id`, `quantite`, `prix`) VALUES
(1, 1, 3, 12.00, 12000),
(2, 1, 4, 15.00, 15000),
(3, 2, 5, 20.00, 70000),
(4, 2, 16, 15.00, 180000),
(5, 3, 15, 35.00, 120000),
(6, 4, 6, 8.00, 40000),
(7, 4, 17, 30.00, 20000),
(8, 4, 18, 15.00, 15000);

-- --------------------------------------------------------

--
-- Structure de la table `recettes`
--

DROP TABLE IF EXISTS `recettes`;
CREATE TABLE IF NOT EXISTS `recettes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produit_menu_id` int NOT NULL,
  `produit_stock_id` int NOT NULL,
  `quantite_requise` decimal(12,4) NOT NULL DEFAULT '0.0000' COMMENT 'Quantité consommée par unité vendue',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produit_stock` (`produit_menu_id`,`produit_stock_id`),
  KEY `fk_recette_stock` (`produit_stock_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `recettes`
--

INSERT INTO `recettes` (`id`, `produit_menu_id`, `produit_stock_id`, `quantite_requise`, `created_at`) VALUES
(1, 1, 24, 0.1500, '2026-05-18 09:52:05'),
(2, 1, 25, 0.0600, '2026-05-18 09:52:05'),
(3, 1, 17, 0.1000, '2026-05-18 09:52:05'),
(4, 1, 18, 0.0500, '2026-05-18 09:52:05'),
(5, 2, 16, 0.3000, '2026-05-18 09:52:05'),
(6, 2, 1, 0.0500, '2026-05-18 09:52:05'),
(9, 5, 5, 0.5000, '2026-05-18 09:52:05'),
(10, 5, 6, 0.2500, '2026-05-18 09:52:05'),
(11, 5, 17, 0.1500, '2026-05-18 09:52:05'),
(12, 5, 18, 0.1000, '2026-05-18 09:52:05'),
(13, 5, 22, 0.0500, '2026-05-18 09:52:05'),
(14, 6, 16, 0.3500, '2026-05-18 09:52:05'),
(15, 6, 18, 0.1000, '2026-05-18 09:52:05'),
(16, 6, 22, 0.0800, '2026-05-18 09:52:05'),
(17, 20, 15, 1.0000, '2026-05-18 09:52:05'),
(18, 20, 6, 0.2000, '2026-05-18 09:52:05'),
(19, 20, 22, 0.0500, '2026-05-18 09:52:05'),
(20, 21, 23, 0.2500, '2026-05-18 09:52:05'),
(21, 21, 22, 0.1000, '2026-05-18 09:52:05'),
(22, 23, 16, 0.3000, '2026-05-18 09:52:05'),
(26, 7, 26, 0.1500, '2026-05-18 09:52:05'),
(27, 7, 25, 0.0600, '2026-05-18 09:52:05'),
(28, 7, 29, 0.0300, '2026-05-18 09:52:05');

-- --------------------------------------------------------

--
-- Structure de la table `salaires`
--

DROP TABLE IF EXISTS `salaires`;
CREATE TABLE IF NOT EXISTS `salaires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `personnel_id` int NOT NULL,
  `mois_annee` varchar(7) NOT NULL COMMENT 'Format: YYYY-MM',
  `montant` decimal(12,0) NOT NULL DEFAULT '0',
  `statut` enum('en attente','paye','partiel') NOT NULL DEFAULT 'en attente',
  `date_generation` date NOT NULL,
  `date_paiement` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_personnel_mois` (`personnel_id`,`mois_annee`),
  KEY `idx_mois_annee` (`mois_annee`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `salaires`
--

INSERT INTO `salaires` (`id`, `personnel_id`, `mois_annee`, `montant`, `statut`, `date_generation`, `date_paiement`, `created_at`) VALUES
(1, 2, '2026-05', 150000, 'en attente', '2026-05-15', NULL, '2026-05-15 14:41:58'),
(2, 3, '2026-05', 200000, 'en attente', '2026-05-15', NULL, '2026-05-15 14:41:58'),
(3, 1, '2026-05', 200000, 'en attente', '2026-05-18', NULL, '2026-05-18 10:00:04'),
(4, 8, '2026-05', 200000, 'en attente', '2026-05-18', NULL, '2026-05-18 10:00:05'),
(5, 9, '2026-05', 200000, 'en attente', '2026-05-18', NULL, '2026-05-18 10:00:05'),
(6, 10, '2026-05', 200000, 'en attente', '2026-05-18', NULL, '2026-05-18 10:00:05'),
(7, 1, '2026-06', 200000, 'en attente', '2026-06-04', NULL, '2026-06-04 01:25:49'),
(8, 2, '2026-06', 200000, 'en attente', '2026-06-04', NULL, '2026-06-04 01:25:49'),
(9, 3, '2026-06', 200000, 'en attente', '2026-06-04', NULL, '2026-06-04 01:25:49'),
(10, 8, '2026-06', 350000, 'en attente', '2026-06-04', NULL, '2026-06-04 01:25:49'),
(11, 9, '2026-06', 200000, 'en attente', '2026-06-04', NULL, '2026-06-04 01:25:49'),
(12, 10, '2026-06', 200000, 'en attente', '2026-06-04', NULL, '2026-06-04 01:25:49');

-- --------------------------------------------------------

--
-- Structure de la table `tables_salle`
--

DROP TABLE IF EXISTS `tables_salle`;
CREATE TABLE IF NOT EXISTS `tables_salle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `places` int NOT NULL DEFAULT '4',
  `zone` varchar(50) DEFAULT NULL,
  `statut` enum('libre','occupee','reservee') NOT NULL DEFAULT 'libre',
  `qr_actif` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `idx_statut` (`statut`),
  KEY `idx_zone` (`zone`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tables_salle`
--

INSERT INTO `tables_salle` (`id`, `numero`, `places`, `zone`, `statut`, `qr_actif`, `created_at`) VALUES
(1, 'T1', 2, 'Terrasse', 'libre', 1, '2026-05-15 14:28:13'),
(2, 'T2', 4, 'Terrasse', 'libre', 1, '2026-05-15 14:28:13'),
(3, 'T3', 6, 'Interieur', 'occupee', 1, '2026-05-15 14:28:13'),
(4, 'T4', 4, 'Interieur', 'libre', 1, '2026-05-15 14:28:13'),
(5, 'VIP1', 8, 'VIP', 'libre', 1, '2026-05-15 14:28:13'),
(11, 'T5', 2, 'Interieur', 'libre', 1, '2026-05-15 14:41:57'),
(12, 'T6', 4, 'Interieur', 'libre', 1, '2026-05-15 14:41:57'),
(13, 'VIP2', 10, 'VIP', 'libre', 1, '2026-05-15 14:41:57'),
(14, 'BALCON1', 4, 'Balcon', 'libre', 1, '2026-05-15 14:41:57'),
(15, 'BALCON2', 4, 'Balcon', 'libre', 1, '2026-05-15 14:41:57');

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_op` enum('entree','sortie') NOT NULL,
  `categorie` varchar(100) NOT NULL,
  `montant` decimal(12,0) NOT NULL DEFAULT '0',
  `reference` varchar(100) DEFAULT NULL,
  `description` text,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type_op`),
  KEY `idx_date` (`date`),
  KEY `idx_categorie` (`categorie`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `transactions`
--

INSERT INTO `transactions` (`id`, `type_op`, `categorie`, `montant`, `reference`, `description`, `date`, `created_at`) VALUES
(1, 'entree', 'Vente', 7000, NULL, 'Paiement Commande #1', '2026-05-15', '2026-05-15 14:28:14'),
(2, 'sortie', 'Achat Stock', 180000, NULL, 'Paiement Facture Boissons SEB', '2026-05-14', '2026-05-15 14:28:14'),
(3, 'sortie', 'Achat Stock', 250000, NULL, 'Paiement Facture Viandes', '2026-05-14', '2026-05-15 14:29:46'),
(4, 'sortie', 'Achat Stock', 120000, NULL, 'Paiement Facture Poissons', '2026-05-15', '2026-05-15 14:41:57'),
(5, 'sortie', 'Achat Stock', 75000, NULL, 'Paiement Facture Légumes', '2026-05-15', '2026-05-15 14:41:57');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','manager','serveur','caissier','cuisinier') NOT NULL DEFAULT 'serveur',
  `poste` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `first_login` tinyint(1) NOT NULL DEFAULT '0',
  `last_seen` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_actif` (`actif`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `poste`, `telephone`, `date_embauche`, `avatar`, `actif`, `first_login`, `last_seen`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'RestoPlus', 'admin@barresto.com', '$2a$10$2teY9jMtaX0itQc1pss7XO8G2Ml40/uo.z2ZW92/j3HxY/7KUDav2', 'admin', 'Administrateur', '677112233', '2025-01-10', 'A', 1, 0, '2026-06-04 01:27:35', '2026-05-18 09:52:04', '2026-06-04 01:27:35'),
(2, 'Dupont', 'Jean', 'serveur@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'serveur', 'Serveur principal', '677223344', '2025-02-15', 'J', 1, 0, '2026-05-18 09:52:04', '2026-05-18 09:52:04', '2026-05-18 09:52:04'),
(3, 'Martin', 'Luc', 'luc.serveur@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'serveur', 'Serveur de salle', '677334455', '2025-02-15', 'L', 1, 0, '2026-05-18 09:52:04', '2026-05-18 09:52:04', '2026-05-18 09:52:04'),
(8, 'Ndi', 'Paul', 'paul.cuisine@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'cuisinier', 'Chef de cuisine', '677889900', '2025-03-01', 'P', 1, 0, '2026-05-18 09:52:04', '2026-05-18 09:52:04', '2026-05-18 09:52:04'),
(9, 'Eto', 'Samuel', 'samuel.manager@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'manager', 'Manager Général', '699887766', '2025-01-01', 'S', 1, 0, '2026-05-18 09:52:04', '2026-05-18 09:52:04', '2026-05-18 09:52:04'),
(10, 'Kamga', 'Alice', 'alice.caisse@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'caissier', 'Caissière', '655112233', '2025-04-10', 'A', 1, 0, '2026-05-18 09:52:04', '2026-05-18 09:52:04', '2026-05-18 09:52:04');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_ca_mensuel`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `v_ca_mensuel`;
CREATE TABLE IF NOT EXISTS `v_ca_mensuel` (
`benefice` decimal(35,0)
,`ca` decimal(34,0)
,`depenses` decimal(34,0)
,`periode` varchar(7)
,`periode_label` varchar(37)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_commandes_en_cours`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `v_commandes_en_cours`;
CREATE TABLE IF NOT EXISTS `v_commandes_en_cours` (
`created_at` timestamp
,`date` date
,`date_prevue` date
,`est_differee` tinyint(1)
,`heure` time
,`heure_prevue` time
,`id` int
,`mode_paiement` enum('especes','orange_money','mtn_momo','carte','transfert')
,`note` text
,`serveur` varchar(100)
,`serveur_id` int
,`serveur_nom` varchar(100)
,`serveur_prenom` varchar(100)
,`source` varchar(50)
,`statut` enum('en attente','en preparation','servie','payee','annulee')
,`table_id` int
,`table_nom` varchar(20)
,`table_numero` varchar(20)
,`total` decimal(12,0)
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_ca_mensuel`
--
DROP TABLE IF EXISTS `v_ca_mensuel`;

DROP VIEW IF EXISTS `v_ca_mensuel`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ca_mensuel`  AS SELECT date_format(`transactions`.`date`,'%Y-%m') AS `periode`, date_format(`transactions`.`date`,'%b %Y') AS `periode_label`, coalesce(sum((case when (`transactions`.`type_op` = 'entree') then `transactions`.`montant` else 0 end)),0) AS `ca`, coalesce(sum((case when (`transactions`.`type_op` = 'sortie') then `transactions`.`montant` else 0 end)),0) AS `depenses`, (coalesce(sum((case when (`transactions`.`type_op` = 'entree') then `transactions`.`montant` else 0 end)),0) - coalesce(sum((case when (`transactions`.`type_op` = 'sortie') then `transactions`.`montant` else 0 end)),0)) AS `benefice` FROM `transactions` WHERE (`transactions`.`date` is not null) GROUP BY date_format(`transactions`.`date`,'%Y-%m') ORDER BY `periode` DESC ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_commandes_en_cours`
--
DROP TABLE IF EXISTS `v_commandes_en_cours`;

DROP VIEW IF EXISTS `v_commandes_en_cours`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_commandes_en_cours`  AS SELECT `c`.`id` AS `id`, `c`.`table_id` AS `table_id`, `c`.`serveur_id` AS `serveur_id`, `c`.`total` AS `total`, `c`.`heure` AS `heure`, `c`.`date` AS `date`, `c`.`statut` AS `statut`, `c`.`source` AS `source`, `c`.`note` AS `note`, `c`.`mode_paiement` AS `mode_paiement`, `c`.`est_differee` AS `est_differee`, `c`.`date_prevue` AS `date_prevue`, `c`.`heure_prevue` AS `heure_prevue`, `c`.`created_at` AS `created_at`, `c`.`updated_at` AS `updated_at`, `t`.`numero` AS `table_nom`, `t`.`numero` AS `table_numero`, `u`.`prenom` AS `serveur`, `u`.`prenom` AS `serveur_prenom`, `u`.`nom` AS `serveur_nom` FROM ((`commandes` `c` left join `tables_salle` `t` on((`c`.`table_id` = `t`.`id`))) left join `utilisateurs` `u` on((`c`.`serveur_id` = `u`.`id`))) WHERE (`c`.`statut` in ('en attente','en preparation','servie')) ;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `fk_cmd_table` FOREIGN KEY (`table_id`) REFERENCES `tables_salle` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cmd_user` FOREIGN KEY (`serveur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `commande_items`
--
ALTER TABLE `commande_items`
  ADD CONSTRAINT `fk_item_cmd` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_item_menu` FOREIGN KEY (`produit_menu_id`) REFERENCES `produits_menu` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `historique_actions`
--
ALTER TABLE `historique_actions`
  ADD CONSTRAINT `fk_hist_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `inventaires`
--
ALTER TABLE `inventaires`
  ADD CONSTRAINT `fk_inv_stock` FOREIGN KEY (`produit_stock_id`) REFERENCES `produits_stock` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inv_user` FOREIGN KEY (`manageur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `fk_mvt_stock` FOREIGN KEY (`produit_stock_id`) REFERENCES `produits_stock` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `fk_paiement_cmd` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `presences`
--
ALTER TABLE `presences`
  ADD CONSTRAINT `fk_presence_user` FOREIGN KEY (`personnel_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `produits_menu`
--
ALTER TABLE `produits_menu`
  ADD CONSTRAINT `fk_menu_cat` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `ravitaillements`
--
ALTER TABLE `ravitaillements`
  ADD CONSTRAINT `fk_rav_fourn` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `ravitaillement_details`
--
ALTER TABLE `ravitaillement_details`
  ADD CONSTRAINT `fk_detail_rav` FOREIGN KEY (`ravitaillement_id`) REFERENCES `ravitaillements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_detail_stock` FOREIGN KEY (`produit_stock_id`) REFERENCES `produits_stock` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `recettes`
--
ALTER TABLE `recettes`
  ADD CONSTRAINT `fk_recette_menu` FOREIGN KEY (`produit_menu_id`) REFERENCES `produits_menu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_recette_stock` FOREIGN KEY (`produit_stock_id`) REFERENCES `produits_stock` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `salaires`
--
ALTER TABLE `salaires`
  ADD CONSTRAINT `fk_salaire_user` FOREIGN KEY (`personnel_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
