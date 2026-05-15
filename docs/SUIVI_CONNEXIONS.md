# Suivi des Connexions et Déconnexions

## Description

Ce système permet de suivre automatiquement les connexions et déconnexions des utilisateurs du bar-restaurant. Les informations sont stockées dans la base de données et peuvent être consultées par les administrateurs.

## Fonctionnalités

### 1. Suivi automatique
- Lorsqu'un utilisateur se connecte, la date, heure, IP et ID de session sont enregistrés
- Lorsqu'il se déconnecte, l'heure de déconnexion et la durée de session sont calculées
- Le tout est stocké dans la table `presences`

### 2. Consultation de l'historique
- Chaque utilisateur peut voir son propre historique de connexions
- Les administrateurs peuvent voir l'historique de tous les utilisateurs
- Filtrage par dates possible

### 3. Sécurité
- L'accès aux informations sensibles (IP) est restreint aux administrateurs
- Chaque session a un ID unique pour un meilleur suivi

## Mise en place

### 1. Exécuter la migration
```bash
cd backend
node scripts/run-migration.js
```

### 2. Redémarrer le serveur
```bash
npm start
```

## API Endpoints

### Pour les utilisateurs

#### Récupérer son historique
```
GET /api/connection-history
```
Query params optionnels:
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Exemple de réponse:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "connexion_date": "2024-05-01",
      "connexion_time": "09:00:00",
      "deconnexion_date": "2024-05-01",
      "deconnexion_time": "17:30:00",
      "duree_session": 30600,
      "duree_formatee": "8h 30m 0s",
      "ip_address": "192.168.1.100",
      "session_id": "session_1714567890123_abc123"
    }
  ],
  "totalSessions": 1
}
```

### Pour les administrateurs

#### Récupérer l'historique de tous les utilisateurs
```
GET /api/connection-history/admin
```
Query params optionnels:
- `userId`: ID de l'utilisateur
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

#### Voir les sessions actives
```
GET /api/connection-history/active-sessions
```

## Implémentation

### Backend

1. **Middleware** (`backend/middleware/connectionTracker.js`)
   - `trackConnection`: Enregistre la connexion
   - `trackDisconnection`: Enregistre la déconnexion

2. **Routes** (`backend/routes/connectionHistory.js`)
   - Routes pour récupérer l'historique

3. **Serveur principal** (`backend/server.js`)
   - Intégration des middlewares

### Frontend

1. **Store** (`frontend/src/store/appStore.js`)
   - Modification de la fonction `logout` pour envoyer une requête de déconnexion

## Schéma de la base de données

### Table: presences
Champs ajoutés:
- `date_connexion`: TIMESTAMP - Date et heure de connexion
- `heure_connexion`: TIME - Heure de connexion
- `date_deconnexion`: TIMESTAMP - Date et heure de déconnexion
- `heure_deconnexion`: TIME - Heure de déconnexion
- `ip_address`: VARCHAR(45) - Adresse IP de connexion
- `session_id`: VARCHAR(255) - ID de session unique
- `duree_session`: INT - Durée de la session en secondes

## Notes importantes

1. **Rétrocompatibilité**: Les modifications sont rétrocompatibles, les anciennes données ne seront pas affectées
2. **Performance**: Des index ont été ajoutés pour optimiser les requêtes
3. **Sécurité**: Les informations sensibles sont protégées par les rôles utilisateur
4. **Stockage**: Les sessions restent dans la base de données pour un historique complet

## Dépannage

### Problèmes courants

1. **La migration échoue**
   - Vérifier que le serveur MySQL est en cours d'exécution
   - S'assurer que l'utilisateur a les permissions nécessaires

2. **Les sessions ne sont pas enregistrées**
   - Vérifier que le middleware est bien intégré dans `server.js`
   - Redémarrer le serveur après les modifications

3. **L'historique ne s'affiche pas**
   - Vérifier que le token JWT est présent dans les requêtes
   - Confirmer que l'utilisateur a les permissions nécessaires

## Pour aller plus loin

1. **Interface utilisateur**: Créer une page pour visualiser l'historique
2. **Statistiques**: Ajouter des graphiques sur les habitudes de connexion
3. **Alertes**: Notifier les administrateurs des sessions anormalement longues
4. **Export**: Permettre d'exporter l'historique au format CSV

---

*Pour plus d'informations, voir le fichier `PROJECT_MEMORY.md`.*