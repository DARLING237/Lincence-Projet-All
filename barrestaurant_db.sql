-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : sam. 16 mai 2026 à 08:30
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
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','manager','serveur','barman','caissier','cuisinier') NOT NULL DEFAULT 'serveur',
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
(1, 'Admin', 'BarResto', 'admin@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'admin', 'Administrateur', NULL, NULL, NULL, 1, 0, '2026-05-15 17:32:05', '2026-05-15 13:39:21', '2026-05-15 17:32:05'),
(2, 'Dupont', 'Jean', 'serveur@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'serveur', 'Serveur principal', NULL, NULL, NULL, 1, 0, '2026-05-15 14:28:13', '2026-05-15 14:28:13', '2026-05-15 14:28:13'),
(3, 'Martin', 'Luc', 'barman@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'barman', 'Chef Barman', NULL, NULL, NULL, 1, 0, '2026-05-15 14:28:13', '2026-05-15 14:28:13', '2026-05-15 14:28:13'),
(8, 'Ndi', 'Paul', 'paul.cuisine@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'cuisinier', 'Chef de cuisine', NULL, NULL, NULL, 1, 0, '2026-05-15 14:41:57', '2026-05-15 14:41:57', '2026-05-15 14:41:57'),
(9, 'Eto', 'Samuel', 'samuel.manager@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'manager', 'Manager G├®n├®ral', NULL, NULL, NULL, 1, 0, '2026-05-15 14:41:57', '2026-05-15 14:41:57', '2026-05-15 14:41:57'),
(10, 'Kamga', 'Alice', 'alice.caisse@barresto.com', '$2a$10$mD5S6tLvJ9gK3XbH0B8uUeW5cR9v1L2mK4jH8gY3V6N1oP5qA0bB7C', 'caissier', 'Caissi├¿re', NULL, NULL, NULL, 1, 0, '2026-05-15 14:41:57', '2026-05-15 14:41:57', '2026-05-15 14:41:57');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
