# 📱 Documentation Pédagogique - ClientQR.jsx

> **Mentor** : Senior Fullstack Developer  
> **Projet** : Bar-Restaurant  
> **Fichier** : `frontend/src/pages/ClientQR.jsx`  
> **Date** : 2026-04-29

---

## 🎯 Tâche 1 : Analyse Globale

### 📌 Rôle du fichier dans l'architecture

Ce fichier est le **cœur de l'expérience client** dans votre application Bar-Restaurant. C'est une **Single Page React** qui permet à un client de :

1. 📷 Scanner un QR code sur sa table
2. 🍔 Consulter le menu digital
3. 🛒 Passer commande directement depuis son smartphone
4. 📊 Suivre l'état de sa commande en temps réel
5. 💳 Payer (espèces ou mobile money)

### 🔗 Avec quels fichiers communique-t-il ?

| Type | Fichier/Service | Comment |
|------|----------------|---------|
| **Backend API** | `/api/menu/produits` | GET - Récupère la carte |
| **Backend API** | `/api/commandes` | POST - Envoie la commande |
| **Backend API** | `/api/commandes/:id/payer` | POST - Traite le paiement |
| **Routing** | `react-router-dom` | Utilise `useParams()` pour récupérer `tableId` depuis l'URL |
| **UI Library** | `framer-motion` | Animations fluides (stepper, modals) |
| **Icons** | `lucide-react` | Icônes (ShoppingCart, Clock, Star, etc.) |
| **Config** | `import.meta.env.VITE_API_URL` | URL de l'API (variable d'environnement) |
| **LocalStorage** | `user` | Récupère l'ID du serveur connecté |

### 🏗️ Place dans l'architecture

```
QR Code (table X) 
    ↓
https://votre-site.com/table/X
    ↓
React Router → ClientQRPage ({ tableId: X })
    ↓
┌─────────────────────────────────────┐
│         ClientQR.jsx                │
│  - Affiche menu                      │
│  - Gère panier                       │
│  - Envoie commande                   │
│  - Suivi + Paiement                  │
└─────────────────────────────────────┘
    ↓
Backend (Node.js/Express)
    ↓
Base de données + Campay (Mobile Money)
```

---

## 📖 Tâche 2 : Explication Ligne par Ligne

---

### 📦 IMPORTS (Lignes 1-21)

---

#### 🔹 Ligne 1
```jsx
import { useState, useEffect, useRef } from "react";
```
**Quoi :** Importe 3 hooks React.  
**Pourquoi :** 
- `useState` → gérer l'état local (panier, produits, loading, etc.)
- `useEffect` → exécuter du code au montage (charger le menu)
- `useRef` → déclaré mais non utilisé (peut être nettoyé)

---

#### 🔹 Lignes 2
```jsx
import { useParams, useNavigate } from "react-router-dom";
```
**Quoi :** Importe les hooks de navigation React Router.  
**Pourquoi :**
- `useParams()` → récupère `tableId` depuis l'URL `/table/:tableId`
- `useNavigate()` → permet de rediriger (non utilisé ici, import de sécurité)

---

#### 🔹 Ligne 3
```jsx
import { motion, AnimatePresence } from "framer-motion";
```
**Quoi :** Bibliothèque d'animations pour React.  
**Pourquoi :** Crée des transitions fluides (modals, stepper, apparition produits). `AnimatePresence` permet d'animer la suppression d'éléments.

---

#### 🔹 Lignes 4-21
```jsx
import {
  ShoppingCart, Clock, Star, Check, Plus, Minus,
  GlassWater, QrCode, Sparkles, Utensils, Send,
  Loader2, FlaskConical, CreditCard, Smartphone, X,
} from "lucide-react";
```
**Quoi :** Importe 16 icônes de la bibliothèque Lucide.  
**Pourquoi :** Ces icônes sont utilisées dans toute l'UI (panier, étoiles best-seller, check paiement, etc.). Lucide est léger et cohérent visuellement.

---

### ⚙️ CONFIGURATION (Lignes 23-27)

---

#### 🔹 Ligne 23
```jsx
const API_URL = import.meta.env.VITE_API_URL || "/api";
```
**Quoi :** Définit l'URL de base de l'API.  
**Pourquoi :** Utilise les variables d'environnement Vite. Si `VITE_API_URL` n'est pas défini, fallback sur `/api` (proxy local en dev).

---

#### 🔹 Lignes 25-27
```jsx
function formatMontant(montant) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " F";
}
```
**Quoi :** Fonction utilitaire de formatage monétaire.  
**Pourquoi :** 
- `Intl.NumberFormat("fr-FR")` → format français (espaces pour milliers)
- Ajoute " F" pour Franc CFA
- Exemple : `1500` → `1 500 F`

---

### 🎭 COMPOSANT PRINCIPAL (Ligne 29)

---

#### 🔹 Ligne 29
```jsx
export function ClientQRPage() {
```
**Quoi :** Déclare le composant React principal.  
**Pourquoi :** C'est le point d'entrée de cette page. `export` permet à React Router de l'importer.

---

### 📊 ÉTAT LOCAL (Lignes 30-58)

---

#### 🔹 Ligne 30
```jsx
const { tableId } = useParams();
```
**Quoi :** Extrait `tableId` de l'URL.  
**Pourquoi :** Si l'URL est `/table/5`, alors `tableId = "5"`. C'est l'identifiant de la table du client.

---

#### 🔹 Ligne 31
```jsx
const navigate = useNavigate();
```
**Quoi :** Initialise la fonction de navigation.  
**Pourquoi :** Prête à être utilisée si besoin de rediriger (ex: QR invalide → autre page).

---

#### 🔹 Lignes 32-46 (useState)
```jsx
const [produits, setProduits] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedCategory, setSelectedCategory] = useState("Tout");
const [cartOpen, setCartOpen] = useState(false);
const [cart, setCart] = useState([]);
const [orderPlaced, setOrderPlaced] = useState(false);
const [orderStep, setOrderStep] = useState(null);
const [orderNumber, setOrderNumber] = useState(null);
const [error, setError] = useState(null);
const [payModal, setPayModal] = useState(false);
const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
const [clientPhone, setClientPhone] = useState("");
const [paying, setPaying] = useState(false);
const [paymentSuccess, setPaymentSuccess] = useState(false);
const categories = ["Tout", "Best-sellers", "Boissons"];
const [note, setNote] = useState("");
```
**Quoi :** Déclare TOUS les états du composant.  
**Pourquoi :** Chaque `useState` gère une partie du cycle de vie :

| État | Initial | Rôle |
|------|---------|------|
| `produits` | `[]` | Liste des produits du menu |
| `loading` | `true` | Affiche le spinner pendant le chargement |
| `selectedCategory` | `"Tout"` | Filtre actif (onglets) |
| `cartOpen` | `false` | Ouvre/ferme le panier coulissant |
| `cart` | `[]` | Articles dans le panier |
| `orderPlaced` | `false` | Passe au mode "suivi de commande" |
| `orderStep` | `null` | Étape du stepper (submitted/preparing/ready) |
| `orderNumber` | `null` | Numéro de commande reçu du backend |
| `error` | `null` | Message d'erreur éventuel |
| `payModal` | `false` | Affiche/masque la modal de paiement |
| `selectedPaymentMode` | `null` | Mode choisi (especes/orange_/mtn_momo) |
| `clientPhone` | `""` | Numéro pour Orange/MTN |
| `paying` | `false` | Loading pendant l'appel API paiement |
| `paymentSuccess` | `false` | Affiche le toast de succès |
| `categories` | Array | Onglets de filtrage (fixe) |
| `note` | `""` | Note client (déclaré mais non utilisé) |

---

#### 🔹 Lignes 49-53
```jsx
const storedUser = localStorage.getItem("user");
const currentUser = storedUser ? JSON.parse(storedUser) : null;
const userId = currentUser?.id;
console.log(userId);
const serveur_id = userId;
```
**Quoi :** Récupère l'utilisateur connecté depuis le localStorage.  
**Pourquoi :** 
- Si un serveur est connecté sur la tablette/PC, son ID est envoyé avec la commande
- `?.` (optional chaining) → évite l'erreur si `currentUser` est null
- ⚠️ **Bug potentiel** : `console.log(userId)` en production est inutile
- ⚠️ **Bug potentiel** : `serveur_id` sera `undefined` si personne n'est connecté

---

#### 🔹 Lignes 54-58
```jsx
const paymentModes = [
  { id: "especes", label: "Espèces", icon: CreditCard },
  { id: "orange_", label: "Orange Money", icon: Smartphone, color: "text-orange-400" },
  { id: "mtn_momo", label: "MTN MoMo", icon: Smartphone, color: "text-yellow-400" },
];
```
**Quoi :** Configuration des modes de paiement.  
**Pourquoi :** Tableau d'objets utilisé pour générer dynamiquement les boutons de la modal de paiement. Chaque mode a un `id` (envoyé au backend), un `label` (affiché), une `icon` et une `color` (Tailwind).

---

### 💳 FONCTION PAIEMENT (Lignes 60-86)

---

#### 🔹 Lignes 60-86
```jsx
const handlePayment = async () => {
  if (!selectedPaymentMode) return;
  if ((selectedPaymentMode === "orange_" || selectedPaymentMode === "mtn_momo") && !clientPhone) return;

  setPaying(true);
  try {
    const res = await fetch(`${API_URL}/commandes/${orderNumber}/payer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode_paiement: selectedPaymentMode,
        num_client: clientPhone || null,
        campay_async: true,
      }),
    });
    const data = await res.json();

    if (data.success) {
      setPaymentSuccess(true);
      setPayModal(false);
    }
  } catch (err) {
    setError("Erreur de paiement");
  }
  setPaying(false);
};
```
**Quoi :** Fonction asynchrone pour traiter le paiement.  
**Pourquoi :**

1. **Lignes 61-62** : Garde-fous (early return) si le formulaire est incomplet
2. **Ligne 64** : Active le loading (`paying = true`)
3. **Lignes 66-74** : Appel API `POST /commandes/:id/payer`
   - `mode_paiement` → le mode choisi
   - `num_client` → numéro de téléphone (ou null)
   - `campay_async: true` → paiement mobile money asynchrone (Campay est une API Camerounaise)
4. **Lignes 77-81** : Si succès → affiche toast succès + ferme modal
5. **Lignes 82-84** : En cas d'erreur réseau → message d'erreur
6. **Ligne 85** : Désactive le loading

⚠️ **Bug** : Ligne 62 vérifie `"orange_"` et `"mtn_momo"`, mais la condition d'affichage du champ téléphone (ligne 593) vérifie `"orange_money"` → incohérence !

---

### 🔄 CHARGEMENT DU MENU (Lignes 88-102)

---

#### 🔹 Lignes 88-102
```jsx
useEffect(() => {
  fetch(`${API_URL}/menu/produits`)
    .then((res) => res.json())
    .then((d) => {
      if (d.success) {
        const available = (d.produits || []).filter((p) => p.dispo !== false);
        setProduits(available);
      }
      setLoading(false);
    })
    .catch(() => {
      setError("Impossible de charger le menu");
      setLoading(false);
    });
}, [tableId]);
```
**Quoi :** Effet de bord qui charge le menu au montage du composant.  
**Pourquoi :**

1. **`useEffect`** : s'exécute après le premier rendu
2. **Dépendance `[tableId]`** : se réexécute si `tableId` change (rare mais possible)
3. **`fetch(...)`** : Appel GET vers le backend pour récupérer tous les produits
4. **`.filter(p => p.dispo !== false)`** : Ne garde que les produits disponibles
   - `!== false` → garde aussi ceux où `dispo` est `undefined` ou `true`
5. **`setLoading(false)`** : Arrête le spinner dans tous les cas
6. **`.catch()`** : En cas d'erreur réseau → message d'erreur

---

### 🔍 FILTRAGE DES PRODUITS (Lignes 104-112)

---

#### 🔹 Lignes 104-110
```jsx
const filterCategory = (p) => {
  const cat = p.categorie_nom || p.categorie || "";
  if (selectedCategory === "Tout") return true;
  if (selectedCategory === "Best-sellers") return p.bestseller;
  if (selectedCategory === "Boissons") return p.type_poste === "bar";
  return cat === selectedCategory;
};
```
**Quoi :** Fonction de filtrage des produits selon la catégorie sélectionnée.  
**Pourquoi :**
- Récupère la catégorie du produit (compatibilité ancien/nouveau format)
- `"Tout"` → tous les produits
- `"Best-sellers"` → filtre sur `p.bestseller` (boolean)
- `"Boissons"` → filtre sur `p.type_poste === "bar"` (les boissons vont au bar)
- Sinon → correspondance exacte catégorie

---

#### 🔹 Ligne 112
```jsx
const filtered = produits.filter(filterCategory);
```
**Quoi :** Applique le filtre aux produits.  
**Pourquoi :** `filtered` est recalculé à chaque rendu si `produits` ou `selectedCategory` changent. C'est la liste affichée.

---

### 🛒 GESTION DU PANIER (Lignes 114-139)

---

#### 🔹 Lignes 114-124
```jsx
const addToCart = (produit) => {
  setCart((prev) => {
    const exists = prev.find((item) => item.id === produit.id);
    if (exists) {
      return prev.map((item) =>
        item.id === produit.id ? { ...item, qte: item.qte + 1 } : item
      );
    }
    return [...prev, { ...produit, qte: 1 }];
  });
};
```
**Quoi :** Ajoute un produit au panier ou incrémente sa quantité.  
**Pourquoi :**
- Utilise la fonction de mise à jour basée sur l'état précédent (`prev`) → bonne pratique
- `find()` → cherche si le produit existe déjà
- Si oui → `map()` pour incrémenter `qte` de 1 (immutabilité)
- Si non → ajoute le produit avec `qte: 1`
- `{ ...produit, qte: 1 }` → copie le produit et ajoute la quantité

---

#### 🔹 Lignes 126-136
```jsx
const removeFromCart = (id) => {
  setCart((prev) => {
    const exists = prev.find((item) => item.id === id);
    if (exists && exists.qte > 1) {
      return prev.map((item) =>
        item.id === id ? { ...item, qte: item.qte - 1 } : item
      );
    }
    return prev.filter((item) => item.id !== id);
  });
};
```
**Quoi :** Retire un produit du panier ou décrémente sa quantité.  
**Pourquoi :**
- Si `qte > 1` → décrémente
- Si `qte === 1` → supprime complètement l'item du tableau avec `filter()`

---

#### 🔹 Lignes 138-139
```jsx
const cartTotal = cart.reduce((sum, item) => sum + item.prix * item.qte, 0);
const cartCount = cart.reduce((sum, item) => sum + item.qte, 0);
```
**Quoi :** Calcule le total et le nombre d'articles.  
**Pourquoi :**
- `cartTotal` → somme de `prix × quantité` pour chaque item
- `cartCount` → somme des quantités (pas le nombre d'items uniques)
- Ces variables sont recalculées à chaque rendu (pas de `useMemo` ici, mais le panier est petit donc c'est OK)

---

### 📤 PASSER LA COMMANDE (Lignes 141-183)

---

#### 🔹 Lignes 141-183
```jsx
const placeOrder = async () => {
  try {
    setError(null);
    const payload = {
      ...(tableId ? { table_numero: String(tableId) } : {}),
      items: cart.map((item) => ({
        produit_menu_id: parseInt(item.id),
        quantite: parseInt(item.qte),
        prix_unitaire: parseFloat(item.prix),
        type_poste: String(item.type_poste),
      })),
      source: "qr_client",
      note: `Commande table ${tableId}`,
      ...(serveur_id ? { serveur_id: parseInt(serveur_id) } : {}),
    };

    const res = await fetch(`${API_URL}/commandes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(payload);
    console.log(res);
    
    const data = await res.json();

    if (data.success) {
      setOrderNumber(data.commandesId);
      setOrderPlaced(true);
      setOrderStep("submitted");
      setCart([]);
      setCartOpen(false);
    } else {
      setError(data.message || "Impossible de passer la commande");
    }
  } catch (err) {
    setError("Erreur de connexion. Réessayer.");
  }
};
```
**Quoi :** Envoie la commande au backend.  
**Pourquoi :**

1. **Ligne 144** : Reset les erreurs précédentes
2. **Lignes 145-156** : Construit le `payload` (corps de la requête)
   - `table_numero` → conditionnel (si `tableId` existe)
   - `items` → transforme le panier en format API (IDs en int, prix en float)
   - `source: "qr_client"` → permet au backend de savoir que ça vient du QR client
   - `note` → note automatique avec le numéro de table
   - `serveur_id` → conditionnel (si un serveur est connecté)
3. **Lignes 158-163** : Appel API `POST /commandes`
4. **Lignes 164-165** : `console.log` → **à supprimer en production** (debug)
5. **Lignes 169-176** : Si succès :
   - `setOrderNumber(data.commandesId)` → récupère l'ID de commande
   - `setOrderPlaced(true)` → passe en mode "suivi"
   - `setOrderStep("submitted")` → première étape du stepper
   - Vide le panier et ferme le panier coulissant
6. **Lignes 177-179** : Si échec → affiche l'erreur du backend
7. **Lignes 180-182** : Erreur réseau

⚠️ **Manque** : Pas de `setLoading(true)` pendant l'envoi → pas de feedback visuel

---

### 🎨 RENDU CONDITIONNEL - CAS D'ERREUR/CHARGEMENT (Lignes 185-330)

---

#### 🔹 Lignes 185-191
```jsx
if (!tableId) {
  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-6">
      <p className="text-center text-lounge-400">QR code invalide — aucun numéro de table spécifié.</p>
    </div>
  );
}
```
**Quoi :** Sécurité si pas de `tableId`.  
**Pourquoi :** Si le client arrive sur la page sans QR code valide (ou URL malformée), on affiche une erreur et on ne continue pas.

---

#### 🔹 Lignes 193-308
```jsx
if (orderPlaced) {
  return (
    // ... JSX du stepper de suivi
  );
}
```
**Quoi :** Mode "suivi de commande".  
**Pourquoi :** Une fois la commande passée, on affiche plus le menu mais le suivi en temps réel.

**Détails du stepper (l.206-248) :**
```
Envoyée → En préparation → Prêt !
```
- Utilise `steps.indexOf(orderStep)` pour savoir où on en est
- Les étapes passées sont colorées en gold (`#D4A853`)
- L'étape active a un gradient + ombre
- Les étapes futures sont grises (`#2E2822`)

**Conditionnelles dans le stepper :**
- `orderStep === "ready"` (l.252-277) → Affiche le bouton "Payer maintenant"
- `orderStep === "preparing"` (l.279-293) → Affiche "En préparation..." avec icône animée

**Bouton "Commander autre chose" (l.295-304) :**
Remet tout à zéro pour permettre une nouvelle commande.

---

#### 🔹 Lignes 310-316
```jsx
if (loading) {
  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#D4A853]" />
    </div>
  );
}
```
**Quoi :** Spinner de chargement.  
**Pourquoi :** Pendant que le menu charge, on affiche une icône de chargement rotative (Lucide `Loader2` + classe Tailwind `animate-spin`).

---

#### 🔹 Lignes 318-330
```jsx
if (error && produits.length === 0) {
  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-6">
      <p className="text-sm text-red-400 text-center mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="...">
        Réessayer
      </button>
    </div>
  );
}
```
**Quoi :** Erreur de chargement du menu.  
**Pourquoi :** Si le menu n'a pas pu charger ET qu'il n'y a aucun produit, on affiche l'erreur + bouton de rechargement.

⚠️ **Note** : Si `produits.length > 0` mais qu'il y a une `error`, l'erreur sera affichée en haut du menu (gérée ailleurs dans le JSX retourné).

---

### 🏠 RENDU PRINCIPAL - MENU (Lignes 332-626)

---

#### 🔹 Lignes 332-361 - HEADER
```jsx
<div className="sticky top-0 z-20 bg-[#1A1714] border-b border-[#D4A853]/8 px-4 py-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C49742]">
        <Utensils size={20} className="text-[#0C0A09]" />
      </div>
      <div>
        <p className="text-sm font-bold text-lounge-100">BarResto</p>
        <p className="text-xs text-lounge-400">Table {tableId}</p>
      </div>
    </div>

    {cart.length > 0 && (
      <motion.button ... >
        <ShoppingCart size={16} />
        <span>{formatMontant(cartTotal)}</span>
        <span className="absolute -top-1.5 -right-1.5 ...">{cartCount}</span>
      </motion.button>
    )}
  </div>
</div>
```
**Quoi :** Barre de navigation sticky en haut.  
**Pourquoi :**
- `sticky top-0` → reste en haut quand on scrolle
- Logo + nom du resto + numéro de table
- Bouton panier (conditionnel) avec :
  - Total formaté
  - Badge avec le nombre d'articles (positionné absolument en haut à droite)

---

#### 🔹 Lignes 363-370 - BANNIÈRE BIENVENUE
```jsx
<div className="px-4 py-4 bg-gradient-to-r from-[#D4A853]/5 to-[#C49742]/5 mx-4 mt-3 rounded-2xl">
  <div className="flex items-center gap-2 mb-1">
    <Sparkles size={14} className="text-[#D4A853]" />
    <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider">Bienvenue</span>
  </div>
  <h2 className="text-xl font-bold text-lounge-100">Notre Carte</h2>
  <p className="text-xs text-lounge-400 mt-0.5">Commandez directement depuis votre table</p>
</div>
```
**Quoi :** Section d'en-tête promotionnelle.  
**Pourquoi :** Donne le ton, accueille le client, incite à commander. Design gradient subtil.

---

#### 🔹 Lignes 372-390 - FILTRES CATÉGORIES
```jsx
<div className="px-4 py-3 overflow-x-auto">
  <div className="flex gap-2 min-w-max">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => setSelectedCategory(cat)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === cat
            ? "bg-[#D4A853] text-lounge-950 shadow-md"
            : "bg-[#1A1714] text-lounge-200 border border-[#D4A853]/10 hover:border-[#D4A853]/20"
        }`}
      >
        {cat === "Boissons" && <GlassWater size={12} className="inline mr-1 -mt-0.5" />}
        {cat === "Best-sellers" && <Star size={12} className="inline mr-1 -mt-0.5" />}
        {cat}
      </button>
    ))}
  </div>
</div>
```
**Quoi :** Onglets de filtrage horizontal.  
**Pourquoi :**
- `overflow-x-auto` → scroll horizontal si beaucoup de catégories
- `min-w-max` → empêche le wrapping
- Bouton actif → fond gold, texte noir
- Bouton inactif → fond sombre, bordure subtile
- Icônes inline pour Boissons (verre) et Best-sellers (étoile)

---

#### 🔹 Lignes 392-471 - GRILLE PRODUITS
```jsx
<div className="px-4 pb-28 flex-1">
  <div className="grid grid-cols-2 gap-3">
    <AnimatePresence mode="popLayout">
      {filtered.map((produit, i) => {
        const inCart = cart.find((item) => item.id === produit.id);
        return (
          <motion.div
            key={produit.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.03 }}
            className={!produit.dispo ? "opacity-50" : ""}
          >
            <div className={`bg-[#1A1714] rounded-2xl shadow-sm border border-[#D4A853]/8 overflow-hidden ${!produit.dispo ? "pointer-events-none" : ""}`}>
              {/* Image ou placeholder */}
              {produit.photo ? (
                <div className="h-28 relative overflow-hidden bg-[#231F1B]">
                  <img src={...} alt={produit.nom} className="h-full w-full object-cover" />
                  {produit.bestseller && (
                    <span className="absolute top-2 left-2 ..."><Star /> Best</span>
                  )}
                </div>
              ) : (
                <div className="h-28 bg-gradient-to-br ...">
                  <GlassWater size={32} className="text-lounge-600" />
                </div>
              )}

              {/* Infos produit + bouton +/- */}
              <div className="p-3">
                <p className="text-sm font-semibold text-lounge-100">{produit.nom}</p>
                <p className="text-[11px] text-lounge-400">{produit.description || ""}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold">{formatMontant(produit.prix)}</span>
                  
                  {!produit.dispo ? (
                    <span className="text-[10px] text-red-400">Indisponible</span>
                  ) : inCart ? (
                    <div className="flex items-center gap-1.5 ...">
                      <button onClick={() => removeFromCart(produit.id)}><Minus /></button>
                      <span>{inCart.qte}</span>
                      <button onClick={() => addToCart(produit)}><Plus /></button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(produit)}><Plus /></button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
</div>
```
**Quoi :** Affichage de la carte en grille 2 colonnes.  
**Pourquoi :**

1. **`grid grid-cols-2`** → 2 produits par ligne (mobile-friendly)
2. **`AnimatePresence`** → permet d'animer l'apparition/disparition des produits quand on change de catégorie
3. **`motion.div`** → chaque produit apparaît avec un léger décalage (`delay: i * 0.03`)
4. **Image** :
   - Si `produit.photo` existe → affiche l'image
   - Sinon → placeholder avec icône `GlassWater`
   - Badge "Best" si `bestseller`
5. **Boutons d'action** :
   - Produit indisponible → texte "Indisponible" + `pointer-events-none`
   - Dans le panier → affiche `- qte +`
   - Sinon → bouton `+` simple

---

#### 🔹 Lignes 473-537 - PANIER COULISSANT (BOTTOM SHEET)
```jsx
<AnimatePresence>
  {cartOpen && cart.length > 0 && (
    <>
      <motion.div ... className="fixed inset-0 bg-black/60 z-30" onClick={() => setCartOpen(false)} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="fixed bottom-0 ... bg-lounge-900 ... rounded-t-3xl ..."
      >
        <div className="p-5">
          <div className="w-10 h-1 bg-[#2E2822] rounded-full mx-auto mb-4" /> {/* Poignée */}
          
          <div className="flex items-center justify-between mb-4">
            <h3>Mon Panier ({cartCount})</h3>
            <button onClick={() => { setCart([]); setCartOpen(false); }}>Vider</button>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#231F1B] rounded-lg">
                    {item.qte}
                  </div>
                  <p>{item.nom}</p>
                </div>
                <p>{formatMontant(item.prix * item.qte)}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t ...">
            <span>Total</span>
            <span>{formatMontant(cartTotal)}</span>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={placeOrder} className="...">
            Commander — {formatMontant(cartTotal)}
          </motion.button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```
**Quoi :** Modal panier qui glisse du bas.  
**Pourquoi :**
- `fixed inset-0 bg-black/60` → overlay sombre derrière
- `initial={{ y: "100%" }}` → commence hors écran (en bas)
- `animate={{ y: 0 }}` → glisse vers le haut
- `max-h-52 overflow-y-auto` → scroll si beaucoup d'articles
- Bouton "Vider" → vide le panier et ferme
- Bouton "Commander" → appelle `placeOrder()`
- `whileTap={{ scale: 0.97 }}` → effet de pression au clic

---

#### 🔹 Lignes 539-558 - BOUTON PANIER FLOTTANT
```jsx
{!cartOpen && cart.length > 0 && (
  <motion.div ... className="fixed bottom-6 ...">
    <button onClick={() => setCartOpen(true)} className="...">
      <div className="flex items-center gap-2">
        <ShoppingCart size={18} />
        <span>Voir mon panier</span>
      </div>
      <div className="flex items-center gap-2">
        <span>{cartCount}</span>
        <span>{formatMontant(cartTotal)}</span>
      </div>
    </button>
  </motion.div>
)}
```
**Quoi :** Bouton flottant en bas de l'écran quand le panier est ouvert.  
**Pourquoi :** Permet d'ouvrir le panier à tout moment sans scroller. Apparaît avec une animation (`initial={{ opacity: 0, y: 100 }}`).

---

#### 🔹 Lignes 561-608 - MODAL PAIEMENT
```jsx
<AnimatePresence>
  {payModal && (
    <>
      <motion.div ... className="fixed inset-0 bg-black/70 z-50" />
      <motion.div ... className="fixed inset-x-4 bottom-4 ... bg-[#1A1714] ...">
        <div className="flex items-center justify-between mb-4">
          <h3>Paiement</h3>
          <button onClick={() => setPayModal(false)}><X /></button>
        </div>

        <div className="text-center mb-4">
          <p>Montant à payer</p>
          <p>{formatMontant(cartTotal)}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {paymentModes.map((mode) => (
            <button key={mode.id} onClick={() => setSelectedPaymentMode(mode.id)} className={`...`}>
              <mode.icon size={24} className={...} />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {(selectedPaymentMode === "orange_money" || selectedPaymentMode === "mtn_momo") && (
          <div className="mb-4">
            <label>Numéro de téléphone</label>
            <input type="tel" value={clientPhone} onChange={...} placeholder="6XX XXX XXX" />
          </div>
        )}

        <button onClick={handlePayment} disabled={...} className="...">
          {paying ? "Paiement en cours..." : "Valider le paiement"}
        </button>
      </motion.div>
    </>
  )}
</AnimatePresence>
```
**Quoi :** Modal de paiement.  
**Pourquoi :**
- Apparaît quand `orderStep === "ready"` (bouton dans le stepper)
- Affiche le montant total
- 3 boutons de choix de paiement (Espèces / Orange / MTN)
- Si Orange ou MTN → affiche le champ téléphone
- Bouton "Valider" → appelle `handlePayment()`
- `disabled` → si mode non choisi ou téléphone manquant

⚠️ **Bug** : Ligne 593 vérifie `"orange_money"` mais le mode est `"orange_"` (ligne 56) → le champ ne s'affichera jamais !

---

#### 🔹 Lignes 610-624 - TOAST SUCCÈS PAIEMENT
```jsx
<AnimatePresence>
  {paymentSuccess && (
    <motion.div ... className="fixed inset-x-4 bottom-4 ... bg-green-500/20 ...">
      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
        <Check size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-green-400">Paiement confirmé !</p>
        <p className="text-xs text-green-400/70">Merci de votre visite</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```
**Quoi :** Notification de succès après paiement.  
**Pourquoi :** Feedback visuel confirmant que le paiement a été traité. Disparaît quand `paymentSuccess` repasse à `false`.

---

## 🚀 Tâche 3 : Résumé des Points d'Amélioration

### ❌ Bugs identifiés

| Ligne | Problème | Solution |
|-------|----------|----------|
| 53 | `serveur_id` peut être `undefined` | Vérifier avant envoi |
| 56 | Mode `"orange_"` incohérent | Renommer en `"orange_money"` partout |
| 593 | Condition `"orange_money"` ne matche pas | Corriger le nom du mode |
| 164-165 | `console.log` en production | Supprimer |
| 47 | `note` déclaré mais non utilisé | Supprimer ou utiliser |

### ✅ Bonnes pratiques détectées

- ✅ Immutabilité dans `setCart` (copie avec spread operator)
- ✅ Optional chaining (`?.`) pour `currentUser?.id`
- ✅ Framer Motion pour UX fluide
- ✅ Filtrage des produits indisponibles
- ✅ Gestion des erreurs réseau

### 🎓 Concepts React utilisés (à maîtriser)

1. **Hooks** : `useState`, `useEffect`
2. **Conditional Rendering** : `if (loading) return ...`
3. **List Rendering** : `.map()` avec `key`
4. **Event Handling** : `onClick`, `onChange`
5. **Async/Await** : `fetch` + `await`
6. **Props/State** : passage de données
7. **Animation** : Framer Motion (`motion.div`, `AnimatePresence`)

---

## 📚 Ressources pour approfondir

- [React Hooks](https://react.dev/reference/react)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Fin de la documentation** 🎉  
*Généré par ton Mentor Senior Fullstack*
