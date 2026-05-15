import { create } from "zustand";

// Try to restore from localStorage
try {
  const stored = localStorage.getItem("user");
  if (stored) {
    const savedUser = JSON.parse(stored);
    window.__initialUser = savedUser;
  }
} catch (_) { /* ignore */ }

const API_URL = import.meta.env.VITE_API_URL || "/api";

function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(`${API_URL}${path}`, { ...options, headers })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        console.error(`apiFetch ${path}: ${res.status}`, data);
        return { success: false, message: data?.message || "Erreur serveur", status: res.status, errors: data?.errors };
      }
      return data;
    });
}

// ── Snake-case → camel-case transformers ──
function toCamelStock(item) {
  return {
    ...item,
    stockActuel: item.stock_actuel,
    stockMin: item.stock_min,
    dernierRavitaillement: item.dernier_ravitaillement,
  };
}
function toCamelPersonnel(item) {
  return {
    ...item,
    dateEmbauche: item.date_embauche,
    online: item.last_seen ? (Date.now() - new Date(item.last_seen).getTime() < 15000) : false,
  };
}
function toCamelSalaire(item) {
  return {
    ...item,
    employe: `${item.prenom} ${item.nom}`,
  };
}
function toCamelCommande(cmd) {
  return {
    ...cmd,
    serveur: cmd.serveur_prenom || cmd.serveur,
    table: cmd.table_numero || cmd.table || cmd.table_nom,
    items: (cmd.items || []).map((i) => ({
      ...i,
      nom: i.produit_nom || i.nom,
    })),
  };
}
function toCamelRavitaillement(item) {
  return {
    ...item,
    fournisseur: item.fournisseur_nom || item.fournisseur,
  };
}

export const useAppStore = create((set, get) => ({
  // ── Auth ──
  user: window.__initialUser || null,
  isAuthenticated: !!window.__initialUser,
  login: (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
    return { success: true, role: userData.role };
  },
  logout: async () => {
    // Envoyer une requête de déconnexion au serveur
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Continue même si la requête échoue
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  // ── Sidebar ──
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ── Data (initially empty, populated via useEffect in components) ──
  tables: [],
  produits: [],
  commandesEnCours: [],
  commandesRecentes: [],
  commandesDifferees: [],
  statsMensuelles: {},
  statsStaff: {},
  revenusData: [],
  ventesParCategorie: [],
  commandesHeure: [],
  personnel: [],
  salariesMois: [],
  alertesStock: [],
  stockProduits: [],
  ravitaillements: [],
  fournisseurs: [],
  impots: [],
  transactions: [],
  connectionHistory: [],

  // ── Fetch Actions ──
  fetchTables: () =>
    apiFetch("/tables").then((d) => { if (d.success) set({ tables: d.tables }); return d; }),

  fetchProduits: () =>
    apiFetch("/menu/produits").then((d) => d.success && set({ produits: d.produits })),

  fetchCommandesEnCours: () =>
    apiFetch("/commandes/en-cours").then((d) => d.success && set({
      // Transform snake_case → camelCase for commandes
      commandesEnCours: (d.commandes || []).map(toCamelCommande),
    })),

  fetchStats: () =>
    apiFetch("/stats/admin").then((d) => {
      if (d.success) {
        set({
          statsMensuelles: d.stats,
          commandesRecentes: d.commandes_recentes || [],
          alertesStock: d.alertes_stock || [],
        });
      }
    }),

  fetchStatsJournalier: () =>
    apiFetch("/stats/journalier").then((d) => {
      if (d.success) set({ statsStaff: d.stats });
    }),

  fetchRevenus: () =>
    apiFetch("/stats/chiffre-affaires").then((d) => d.success && set({ revenusData: d.revenus })),

  fetchCommandesHeure: () =>
    apiFetch("/stats/commandes-par-heure").then((d) => d.success && set({ commandesHeure: d.commandesHeure })),

  fetchPersonnel: () =>
    apiFetch("/personnel").then((d) => d.success && set({
      personnel: (d.personnel || []).map(toCamelPersonnel),
    })),

  heartbeat: () =>
    apiFetch("/auth/heartbeat", { method: "POST" }),

  fetchSalaires: () =>
    apiFetch("/personnel/salaires").then((d) => d.success && set({
      salariesMois: (d.salaires || []).map(toCamelSalaire),
    })),

  fetchStock: () =>
    apiFetch("/stock").then((d) => d.success && set({
      stockProduits: (d.stock || []).map(toCamelStock),
    })),

  fetchAlertesStock: () =>
    apiFetch("/stock/alertes").then((d) => d.success && set({
      alertesStock: (d.alertes || []).map(toCamelStock),
    })),

  fetchRavitaillements: () =>
    apiFetch("/stock/ravitaillements").then((d) => d.success && set({
      ravitaillements: (d.ravitaillements || []).map(toCamelRavitaillement),
    })),

  fetchFournisseurs: () =>
    apiFetch("/fournisseurs").then((d) => d.success && set({ fournisseurs: d.fournisseurs })),

  fetchImpots: () =>
    apiFetch("/finances/impots").then((d) => d.success && set({ impots: d.impots })),

  // ── Mutations ──
  updateTable: (id, data) => {
    console.log("[updateTable] id:", id, "data:", data);
    return apiFetch(`/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).then((d) => {
      console.log("[updateTable] response:", d);
      if (d.success) {
        set((s) => ({
          tables: s.tables.map((t) => {
            if (t.id !== id) return t;
            const merged = { ...t, ...data };
            if (d.table) {
              merged.qrActif = d.table.qr_actif !== undefined ? !!d.table.qr_actif : t.qrActif;
              if (d.table.statut) merged.statut = d.table.statut;
            }
            return merged;
          }),
        }));
      }
    });
  },

  addTable: (data) =>
    apiFetch("/tables", {
      method: "POST",
      body: JSON.stringify({
        numero: data.numero,
        places: data.places,
        zone: data.zone,
        statut: data.statut || "libre",
        qr_actif: data.qrActif !== undefined ? data.qrActif : true,
      }),
    }).then((d) => {
      if (d.success) {
        get().fetchTables();
      }
      return d;
    }),

  deleteTable: (id) =>
    apiFetch(`/tables/${id}`, { method: "DELETE" }).then((d) => {
      if (d.success) {
        set((s) => ({
          tables: s.tables.filter((t) => t.id !== id),
        }));
      }
    }),

  addCommande: (cmdData) =>
    apiFetch("/commandes", {
      method: "POST",
      body: JSON.stringify(cmdData),
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
      }
      return d;
    }),

  updateCommandeStatut: (id, statut) =>
    apiFetch(`/commandes/${id}/statut`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    }).then((data) => {
      if (!data.success) {
        console.error("Erreur update statut:", data.message);
        return;
      }
      set((s) => ({
        commandesEnCours: s.commandesEnCours.map((c) =>
          c.id === id ? { ...c, statut } : c
        ),
      }));
      // Rafraîchir les commandes en cours après un délai
      setTimeout(() => get().fetchCommandesEnCours(), 500);
    }),

  removeCommande: (id) =>
    apiFetch(`/commandes/${id}`, { method: "DELETE" }).then(() => {
      set((s) => ({
        commandesEnCours: s.commandesEnCours.filter((c) => c.id !== id),
      }));
    }),

  // Transfert de commande vers une autre table
  transfererCommande: (commandeId, nouvelleTableId) =>
    apiFetch(`/commandes/${commandeId}/transferer`, {
      method: "PATCH",
      body: JSON.stringify({ nouvelle_table_id: nouvelleTableId }),
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
        get().fetchTables();
      }
      return d;
    }),

  // Modifier la quantité d'un item (ou supprimer si quantité = 0)
  modifierItemCommande: (commandeId, itemId, quantite) =>
    apiFetch(`/commandes/${commandeId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantite }),
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
      }
      return d;
    }),

  // Ajouter un item à une commande existante
  ajouterItemCommande: (commandeId, itemData) =>
    apiFetch(`/commandes/${commandeId}/items`, {
      method: "POST",
      body: JSON.stringify(itemData),
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
      }
      return d;
    }),

  // Différer une commande
  differerCommande: (commandeId, datePrevue, heurePrevue) =>
    apiFetch(`/commandes/${commandeId}/differer`, {
      method: "PATCH",
      body: JSON.stringify({ date_prevue: datePrevue, heure_prevue: heurePrevue }),
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
      }
      return d;
    }),

  // Activer une commande différée
  activerCommande: (commandeId) =>
    apiFetch(`/commandes/${commandeId}/activer`, {
      method: "PATCH",
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
      }
      return d;
    }),

  // Récupérer les commandes différées
  fetchCommandesDifferees: () =>
    apiFetch("/commandes/differees").then((d) => {
      if (d.success) {
        set({ commandesDifferees: d.commandes });
      }
      return d;
    }),

  // Mettre à jour le total d'une commande après modification
  updateCommandeTotal: (id, nouveauTotal) =>
    set((s) => ({
      commandesEnCours: s.commandesEnCours.map((c) =>
        c.id === id ? { ...c, total: nouveauTotal } : c
      ),
    })),

  createProduit: (data) => {
    const token = localStorage.getItem("token");
    // If photo is a File, use multipart upload
    if (data.photo instanceof File) {
      const formData = new FormData();
      formData.append("nom", data.nom);
      formData.append("prix", data.prix);
      formData.append("categorie_id", data.categorie_id);
      if (data.desc) formData.append("description", data.desc);
      formData.append("type_poste", data.type_poste);
      formData.append("dispo", data.dispo !== false);
      formData.append("bestseller", data.bestseller === true);
      formData.append("photo", data.photo);
      return fetch(`${API_URL}/menu/produits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then((r) => r.json()).then((d) => {
        if (d.success) get().fetchProduits();
        return d;
      });
    }
    return apiFetch("/menu/produits", {
      method: "POST",
      body: JSON.stringify({
        nom: data.nom,
        prix: data.prix,
        categorie_id: data.categorie_id,
        description: data.desc || null,
        type_poste: data.type_poste,
        dispo: data.dispo !== false,
        bestseller: data.bestseller === true,
      }),
    }).then((d) => {
      if (d.success) get().fetchProduits();
      return d;
    });
  },

  updateProduit: (id, data) => {
    // If data has a File (photo upload), use FormData
    if (data.photo instanceof File) {
      const formData = new FormData();
      formData.append("photo", data.photo);
      const token = localStorage.getItem("token");
      return fetch(`${API_URL}/menu/produits/${id}/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then((r) => r.json()).then((d) => {
        if (d.success) get().fetchProduits();
        return d;
      });
    }
    return apiFetch(`/menu/produits/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...(data.nom && { nom: data.nom }),
        ...(data.prix && { prix: data.prix }),
        ...(data.desc !== undefined && { description: data.desc || data.description }),
        ...(data.type_poste && { type_poste: data.type_poste }),
        dispo: data.dispo,
        bestseller: data.bestseller,
        ...(data.photo && { photo: data.photo }),
      }),
    }).then(() => {
      get().fetchProduits();
    });
  },

  deleteProduitPhoto: (id) =>
    apiFetch(`/menu/produits/${id}/photo`, { method: "DELETE" }).then((d) => {
      if (d.success) get().fetchProduits();
      return d;
    }),

  updateCommandeItemStatut: (id, statut) =>
    apiFetch(`/commandes/items/${id}/statut`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    }).then(() => {
      get().fetchCommandesEnCours();
    }),

  // ── Stock mutations ──
  createRavitaillement: (data) =>
    apiFetch("/stock/ravitaillements", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((d) => {
      if (d.success) {
        get().fetchRavitaillements();
        get().fetchStock();
        get().fetchAlertesStock();
      }
      return d;
    }),

  // ── Salaires ──
  payerSalaire: (id) =>
    apiFetch(`/personnel/salaires/${id}/payer`, {
      method: "PATCH",
    }).then(() => {
      get().fetchSalaires();
    }),

  updateSalaireMontant: (id, montant) =>
    apiFetch(`/personnel/salaires/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ montant }),
    }).then(() => {
      get().fetchSalaires();
    }),

  // ── Impots ──
  payerImpot: (id) =>
    apiFetch(`/finances/impots/${id}/payer`, {
      method: "PATCH",
    }).then(() => {
      get().fetchImpots();
    }),

  // ── Bilan financier ──
  fetchBilan: (mois) =>
    apiFetch(`/finances/bilan${mois ? `?mois=${mois}` : ""}`).then((d) => d.success ? d.bilan : null),

  // ── Transactions ──
  fetchTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type_op) params.set("type_op", filters.type_op);
    if (filters.date) params.set("date", filters.date);
    if (filters.mois) params.set("mois", filters.mois);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/finances/transactions${qs}`).then((d) => d.success && set({ transactions: d.transactions }));
  },

  // ── Paiement ──
  payerCommande: (id, modePaiement, reference, numClient, campayAsync) =>
    apiFetch(`/commandes/${id}/payer`, {
      method: "POST",
      body: JSON.stringify({
        mode_paiement: modePaiement,
        reference,
        num_client: numClient,
        campay_async: campayAsync,
      }),
    }).then((d) => {
      if (d.success) {
        get().fetchCommandesEnCours();
      }
      return d;
    }),

  // ── Vérification paiement Campay ──
  verifyPayment: (id) =>
    apiFetch(`/commandes/${id}/payer/verify`, {
      method: "POST",
    }),

  // ── Rapport ──
  fetchRapport: (period, date) =>
    apiFetch(`/stats/rapport?period=${period || "journalier"}${date ? `&date=${date}` : ""}`).then((d) => d.success ? d.rapport : null),

  // ── Historique des connexions ──
  fetchConnectionHistory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.dateDebut) params.set("startDate", filters.dateDebut);
    if (filters.dateFin) params.set("endDate", filters.dateFin);
    if (filters.userId) params.set("userId", filters.userId);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/connection-history/admin${qs}`).then((d) => {
      if (d.success) {
        set({ connectionHistory: d.history || [] });
      }
      return d;
    });
  },
}));
