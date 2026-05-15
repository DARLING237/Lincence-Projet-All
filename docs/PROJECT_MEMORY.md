# Mémoire du Projet Bar-Restaurant

## Vue d'ensemble
Projet de gestion de bar-restaurant avec frontend (React) et backend (Node.js/Express).

## Structure du projet
```
bar-restaurant/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   └── database.sql
└── frontend/
    └── src/
        └── store/
```

## Modifications apportées - Suivi des connexions/déconnexions

### 1. Modifications de la base de données

**Fichier modifié:** `backend/database.sql`

- Ajout de champs dans la table `presences`:
  - `date_connexion` TIMESTAMP
  - `heure_connexion` TIME
  - `date_deconnexion` TIMESTAMP
  - `heure_deconnexion` TIME
  - `ip_address` VARCHAR(45)
  - `session_id` VARCHAR(255)
  - `duree_session` INT (durée en secondes)
- Mise à jour du statut ENUM pour inclure 'session_active'

### 2. Script de migration

**Fichier créé:** `backend/scripts/add-connection-tracking.sql`

- Script pour ajouter les nouveaux champs à la table existante
- Création d'index pour optimiser les performances

### 3. Middleware de suivi des connexions

**Fichier créé:** `backend/middleware/connectionTracker.js`

Fonctionnalités:
- `trackConnection`: Enregistre la connexion d'un utilisateur
- `trackDisconnection`: Enregistre la déconnexion et calcule la durée
- `getConnectionHistory`: Récupère l'historique des connexions

### 4. Mise à jour du serveur principal

**Fichier modifié:** `backend/server.js`

- Import du middleware `trackConnection`
- Application du middleware après le request logger

### 5. Mise à jour de l'authentification

**Fichier modifié:** `backend/routes/auth.js`

- Import du middleware `trackDisconnection`
- Ajout de la route `/api/auth/logout` pour enregistrer la déconnexion

### 6. Mise à jour du frontend

**Fichier modifié:** `frontend/src/store/appStore.js`

- Modification de la fonction `logout` pour envoyer une requête de déconnexion au serveur

### 7. Routes API pour l'historique

**Fichier créé:** `backend/routes/connectionHistory.js`

- `/api/connection-history`: Récupère l'historique de l'utilisateur connecté
- `/api/connection-history/admin`: Récupère l'historique de tous les utilisateurs (admin)
- `/api/active-sessions`: Voir les sessions actives (admin)

## Fonctionnalités implémentées

### Suivi des connexions
- Enregistrement automatique de la date et heure de connexion
- Stockage de l'IP et du user-agent
- Génération d'un ID de session unique

### Suivi des déconnexions
- Enregistrement de la date et heure de déconnexion
- Calcul automatique de la durée de session
- Mise à jour de l'enregistrement dans la base de données

### Historique des connexions
- Consultation personnelle de son historique
- Consultation par l'administrateur de tous les utilisateurs
- Filtrage par dates
- Affichage de la durée formatée

### Sécurité
- L'accès à l'historique complet est réservé aux administrateurs
- Les informations sensibles (IP) sont stockées de manière sécurisée

## Détails techniques

### IDs de session
- Format: `timestamp_uniqueID`
- Exemple: `session_1712345678901_abc123def456`

### Formatage des durées
- Les durées sont affichées en format lisible:
  - Plus d'une heure: `2h 30m 45s`
  - Moins d'une heure: `30m 45s`
  - Moins d'une minute: `45s`

### Stockage des sessions
- Les sessions sont stockées dans la table `presences`
- Une session est marquée comme 'session_active' au début
- À la déconnexion, le statut change à 'present' et la durée est calculée

## Points d'attention

1. **Compatibilité**: Les modifications sont rétrocompatibles, les champs ajoutés sont NULL par défaut
2. **Performance**: Des index ont été créés sur les champs fréquemment utilisés
3. **Sécurité**: L'accès aux données sensibles est restreint aux administrateurs
4. **Nettoyage**: Les anciennes sessions restent dans la base pour l'historique

## Prochaines étapes possibles

1. **Interface utilisateur**: Créer une page pour visualiser l'historique
2. **Statistiques**: Ajouter des graphiques sur les habitudes de connexion
3. **Alertes**: Notifier les administrateurs des sessions anormalement longues
4. **Export**: Permettre d'exporter l'historique au format CSV

---

*Ce fichier doit être mis à jour avec toute nouvelle modification importante apportée au projet.*