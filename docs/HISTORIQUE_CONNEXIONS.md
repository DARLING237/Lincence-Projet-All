# Historique des Connexions

## Description

Cette nouvelle fonctionnalité permet de suivre et d'analyser les sessions des utilisateurs du système. Elle est accessible depuis le dashboard administrateur sous l'onglet "Historique".

## Fonctionnalités disponibles

### 1. Visualisation de l'historique
- Liste complète de toutes les connexions
- Filtres par date et par utilisateur
- Tri et recherche

### 2. Statistiques
- Nombre total de connexions
- Durée moyenne des sessions
- Nombre de sessions longues (> 1 heure)
- Nombre d'utilisateurs actifs

### 3. Graphiques
- Évolution des connexions par jour
- Heures d'activité (connexions par heure)
- Top des utilisateurs par nombre de sessions

### 4. Alertes
- Notification automatique des sessions anormalement longues
- Affichage des 5 sessions les plus longues en haut de la page

### 5. Export
- Export de l'historique au format CSV
- Colonnes incluses : ID, Utilisateur, Email, Rôle, Date, Heure, Durée, IP, Appareil

## Accès

1. Connectez-vous en tant qu'administrateur
2. Cliquez sur "Historique" dans le menu de gauche
3. La page s'affiche avec toutes les données par défaut

## Utilisation des filtres

- **Date de début** : Sélectionnez une date de début pour filtrer les connexions
- **Date de fin** : Sélectionnez une date de fin pour filtrer les connexions
- **Utilisateur** : Sélectionnez un utilisateur spécifique pour voir uniquement ses sessions

Cliquez sur "Appliquer les filtres" pour mettre à jour l'affichage.

## Export CSV

1. Cliquez sur le bouton "Exporter CSV" en haut à droite
2. Un fichier CSV sera téléchargé avec le nom `historique_connexions_[date].csv`
3. Le fichier contient toutes les connexions visibles (après application des filtres)

## API

### Endpoint
```
GET /api/auth/historique
```

### Paramètres optionnels
- `date_debut` (YYYY-MM-DD)
- `date_fin` (YYYY-MM-DD)
- `utilisateur` (ID de l'utilisateur)

### Réponse
```json
{
  "success": true,
  "historique": [
    {
      "id": 1,
      "utilisateur_id": 1,
      "utilisateur_nom": "John Doe",
      "utilisateur_email": "john@example.com",
      "utilisateur_role": "admin",
      "date_connexion": "2025-12-15",
      "heure_connexion": "2025-12-15T10:30:00Z",
      "duree_session": 3600,
      "adresse_ip": "192.168.1.1",
      "appareil": "Chrome Windows"
    }
  ]
}
```

## Notes

- La durée est exprimée en secondes
- Les sessions sont considérées comme "longues" si elles dépassent 1 heure (3600 secondes)
- Les données sont actualisées en temps réel
- L'historique contient toutes les connexions depuis la mise en place de la fonctionnalité