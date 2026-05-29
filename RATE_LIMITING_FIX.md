# 🔧 Fix Rate Limiting (Erreur 429)

## Problem
- ❌ **POST `/api/auth/heartbeat` → 429 Too Many Requests**
- ❌ **GET `/api/stats/*` → 429 Too Many Requests**  
- ❌ **SyntaxError: Unexpected token 'T', "Too many requests"...**

Le frontend faisait un heartbeat **toutes les 10 secondes**, ce qui générait **360 requêtes/heure par utilisateur**, dépassant le rate limiter backend configuré à **100 requêtes/15min** (soit ~400/heure max).

De plus, quand le serveur retournait du HTML au lieu de JSON, le frontend crashait avec un parsing error.

---

## ✅ Solutions Implémentées

### 1️⃣ **Backend** : Augmenter le rate limiter
**Fichier** : [backend/server.js](backend/server.js#L48)

```javascript
// AVANT : max: 100 requêtes/15min
// APRÈS : max: 500 requêtes/15min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Augmenté de 100 à 500
  skip: (req) => req.method === "OPTIONS",
  standardHeaders: true,
  legacyHeaders: false
});
```

**Impact** : Permet jusqu'à ~2000 requêtes/heure au lieu de ~400.

---

### 2️⃣ **Frontend** : Augmenter l'intervalle du heartbeat
**Fichier** : [frontend/src/App.jsx](frontend/src/App.jsx#L42)

```javascript
// AVANT : heartbeat toutes les 10 secondes = 360 req/h
// APRÈS : heartbeat toutes les 30 secondes = 120 req/h
const interval = setInterval(heartbeat, 30000); // 30s au lieu de 10s
```

**Impact** : Réduit les requêtes du heartbeat de 360/h à 120/h par utilisateur.

---

### 3️⃣ **Frontend** : Gérer les erreurs 429 silencieusement
**Fichier** : [frontend/src/store/appStore.js](frontend/src/store/appStore.js#L162)

```javascript
heartbeat: () =>
  apiFetch("/auth/heartbeat", { method: "POST" }).catch((err) => {
    // Ignorer silencieusement les erreurs 429
    if (err?.status === 429) {
      console.warn("⚠️ Rate limit atteint, heartbeat skippé");
      return null;
    }
    throw err;
  }),
```

**Impact** : Si une requête 429 arrive quand même, elle ne crash pas l'app.

---

### 4️⃣ **Frontend** : Corriger le JSON parsing pour les réponses HTML
**Fichier** : [frontend/src/store/appStore.js](frontend/src/store/appStore.js#L14)

```javascript
// AVANT : await res.json() pouvait échouer si HTML retourné
// APRÈS : try-catch pour gérer les réponses non-JSON
try {
  data = await res.json();
} catch (e) {
  console.warn(`⚠️ JSON parse failed for ${path}: ${res.status}`);
  data = { message: `Erreur serveur (${res.status})` };
}
```

**Impact** : Élimine les `SyntaxError: Unexpected token 'T'...` quand Vercel retourne du HTML.

---

## 📊 Résultats Attendus

| Métrique | Avant | Après |
|----------|-------|-------|
| Requêtes heartbeat/h (1 user) | 360 | 120 |
| Rate limiter max/15min | 100 | 500 |
| Erreurs 429 par session | ❌ Crash | ✅ Ignorées |
| Parsing errors JSON | ❌ SyntaxError | ✅ Gérées |

---

## 🚀 Déploiement

1. ✅ Push du backend vers Vercel
   ```bash
   git push origin main
   ```

2. ✅ Le frontend se rebuild automatiquement

3. ✅ Tester dans le navigateur : devtools → Network → vérifier que `heartbeat` revient maintenant toutes les 30s

---

## 🧪 Validation

1. Ouvrir DevTools (F12) → Network tab
2. Observer les requêtes `heartbeat` → doivent être **espacées de 30s** (au lieu de 10s)
3. Vérifier qu'aucune erreur 429 ne spam la console
4. Vérifier que l'app reste responsive (pas de crash)

---

## 📝 Notes

- Si le problème persiste, vérifier les **logs Vercel** pour voir si d'autres endpoints génèrent trop de traffic
- Le heartbeat peut être augmenté à 60s si désiré (moins de pression serveur)
- Les autres endpoints bénéficient aussi de la limite augmentée à 500 req/15min
