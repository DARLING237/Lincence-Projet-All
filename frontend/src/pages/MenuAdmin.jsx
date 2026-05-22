import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  BookOpen, Plus, Search, Camera, Star, Pencil, ToggleLeft, ToggleRight, Filter, Layers, X, CheckCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

function ProductFormModal({ product, categories = [], onSave, onClose }) {
  const [form, setForm] = useState(() => product || {
    nom: "", prix: 0, categorie_id: categories[0]?.id || 1, type_poste: "cuisine",
    desc: "", bestseller: false, dispo: true,
    photo: null,
  });
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[560px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
          <h3 className="text-lg font-bold text-zinc-50">{product ? "Modifier le produit" : "Nouveau produit"}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Nom du produit</label>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Prix (F CFA)</label>
              <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: +e.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Categorie</label>
              <select value={form.categorie_id} onChange={(e) => setForm({ ...form, categorie_id: +e.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Type</label>
              <select value={form.type_poste} onChange={(e) => setForm({ ...form, type_poste: e.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                <option value="cuisine">Cuisine (Restaurant)</option>
                <option value="tous">Tous (Menu &amp; Boissons)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Best-seller</label>
              <button onClick={() => setForm({ ...form, bestseller: !form.bestseller })}
                className="flex items-center gap-2 mt-2 text-sm font-bold cursor-pointer transition-colors">
                {form.bestseller ? <ToggleRight size={24} className="text-brand-500" /> : <ToggleLeft size={24} className="text-zinc-500" />}
                <span className={form.bestseller ? "text-brand-500" : "text-zinc-500"}>
                  {form.bestseller ? "Oui" : "Non"}
                </span>
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Disponible</label>
              <button onClick={() => setForm({ ...form, dispo: !form.dispo })}
                className="flex items-center gap-2 mt-2 text-sm font-bold cursor-pointer transition-colors">
                {form.dispo ? <ToggleRight size={24} className="text-brand-500" /> : <ToggleLeft size={24} className="text-zinc-500" />}
                <span className={form.dispo ? "text-brand-500" : "text-zinc-500"}>
                  {form.dispo ? "Oui" : "Non"}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Description</label>
            <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
          </div>
          {/* Photo upload — stores a File object, not base64 */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Photo</label>
            <div className="flex items-center gap-4">
              {form.photo instanceof File ? (
                <img src={URL.createObjectURL(form.photo)} alt="Apercu" className="h-16 w-16 rounded-xl object-cover border border-white/10 shadow-md" />
              ) : product && product.photo ? (
                <img src={`http://${window.location.hostname}:3000${product.photo}`} alt="Actuelle" className="h-16 w-16 rounded-xl object-cover border border-white/10 shadow-md" />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-zinc-900 border border-dashed border-white/20 flex items-center justify-center">
                  <Camera size={20} className="text-zinc-500" />
                </div>
              )}
              <label className="h-11 px-5 rounded-xl border border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white text-sm font-bold flex items-center cursor-pointer transition-all shadow-sm">
                Choisir une photo...
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, photo: file });
                  }} />
              </label>
            </div>
          </div>
          <div className="pt-2">
            <button onClick={() => { onSave(form); onClose(); }}
              className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
              {product ? "Modifier le produit" : "Ajouter le produit"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export function MenuAdmin() {
  const produits = useAppStore((s) => s.produits);
  const updateProduit = useAppStore((s) => s.updateProduit);
  const deleteProduitPhoto = useAppStore((s) => s.deleteProduitPhoto);
  const createProduit = useAppStore((s) => s.createProduit);
  const fetchProduits = useAppStore((s) => s.fetchProduits);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tout");
  const [showBest, setShowBest] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    fetchProduits();
    
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/menu/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDbCategories(data.categories);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [fetchProduits]);

  const categories = [...new Set(produits.map((p) => p.categorie_nom || p.categorie))];
  const filtered = produits.filter((p) => {
    const cat = p.categorie_nom || p.categorie;
    if (filterCat !== "Tout" && cat !== filterCat) return false;
    if (showBest && !p.bestseller) return false;
    if (search && !p.nom.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: produits.length,
    dispo: produits.filter((p) => p.dispo).length,
    bestsellers: produits.filter((p) => p.bestseller).length,
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  const handlePhotoUpload = async (e, prodId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(prodId);
    try {
      // Read file as base64 and send via PUT instead of multipart upload
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await updateProduit(prodId, { photo: base64 });
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploadingId(null);
  };

  const toggleBestseller = async (prodId, current) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/menu/produits/${prodId}/bestseller`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bestseller: !current }),
      });
      fetchProduits();
    } catch (err) {
      console.error("Toggle bestseller failed:", err);
    }
  };

  const imageUrl = (photoData) => {
    if (!photoData) return "";
    // If stored as base64 data URI, use directly
    if (photoData.startsWith("data:image")) return photoData;
    // If stored as file path, use relative path (goes through Vite proxy)
    return `${photoData}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Menu</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestion des produits et categories</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
          <Plus size={18} />
          Ajouter produit
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "Total produits", value: counts.total, icon: Layers },
          { label: "Best-sellers", value: counts.bestsellers, icon: Star },
          { label: "Categories", value: categories.length, icon: Filter },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="show" className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{s.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-white/5">
                <s.icon size={16} className="text-zinc-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-50">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 pl-11 pr-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2 bg-zinc-900/50 backdrop-blur-md p-1 rounded-xl border border-white/5">
          <button key="all" onClick={() => setFilterCat("Tout")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCat === "Tout" ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"}`}>
            Tout
          </button>
          {categories.map((cat, i) => (
            <button key={`${cat}-${i}`} onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCat === cat ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"}`}>
              {cat}
            </button>
          ))}
        </div>
        <button onClick={() => setShowBest(!showBest)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${showBest ? "bg-brand-500/10 border-brand-500/30 text-brand-500" : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:bg-zinc-800"}`}>
          <Star size={16} className={showBest ? "fill-brand-500 text-brand-500" : "text-zinc-500"} />
          Best-sellers
        </button>
      </div>

      {/* Invisible upload helper — dynamically attached per product click */}

      {/* Products Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((prod, idx) => (
          <motion.div key={prod.id != null ? `${prod.id}-${prod.nom}` : idx} variants={itemVariants}
            className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-lg card-hover flex flex-col group">
            {/* Image area — click to upload */}
            <div
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => handlePhotoUpload(e, prod.id);
                input.click();
              }}
              className={`h-40 relative flex items-center justify-center cursor-pointer transition-colors ${prod.dispo ? "bg-zinc-800 group-hover:bg-zinc-700" : "bg-red-950/20"}`}
            >
              {uploadingId === prod.id ? (
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider animate-pulse">Chargement...</span>
              ) : prod.photo ? (
                <>
                  <img src={imageUrl(prod.photo)} alt={prod.nom} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Camera size={16} /> Changer</span>
                  </div>
                  <button title="Supprimer photo"
                    onClick={(e) => { e.stopPropagation(); deleteProduitPhoto(prod.id); }}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors z-10 backdrop-blur-md">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <Camera size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Ajouter photo</span>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    {prod.bestseller && <Star size={14} className="text-brand-500 fill-brand-500 shrink-0" />}
                    <h3 className="text-base font-bold text-zinc-50 truncate">{prod.nom}</h3>
                  </div>
                  <p className="text-xs font-medium text-zinc-400 mt-1 line-clamp-2">{prod.description}</p>
                </div>
                <button onClick={() => setEditForm(prod)} className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors flex-shrink-0">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-lg font-black text-brand-500">{formatMontant(prod.prix)}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleBestseller(prod.id, prod.bestseller)}
                      className="flex items-center gap-1 text-xs cursor-pointer group/toggle" title="Best-seller">
                      {prod.bestseller ? <ToggleRight size={24} className="text-brand-500" /> : <ToggleLeft size={24} className="text-zinc-600 group-hover/toggle:text-zinc-400" />}
                    </button>
                    <button onClick={() => updateProduit(prod.id, { dispo: !prod.dispo })}
                      className="flex items-center gap-1.5 text-xs font-bold cursor-pointer group/toggle">
                      {prod.dispo ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-red-500/50 group-hover/toggle:text-red-500" />}
                      <span className={`${prod.dispo ? "text-emerald-500" : "text-red-500/80"}`}>
                        {prod.dispo ? "Dispo" : "Rupture"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-400 border border-white/5">
                    {prod.type_poste || prod.categorie_type || "bar"}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-brand-500/10 px-2 py-1 text-xs font-bold text-brand-500 border border-brand-500/20 truncate">
                    {prod.categorie_nom || prod.categorie || "—"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* -- Edit Modal -- */}
      <AnimatePresence>
        {editForm && (
          <ProductFormModal
            product={editForm}
            categories={dbCategories}
            onSave={(data) => updateProduit(editForm.id, data)}
            onClose={() => setEditForm(null)}
          />
        )}
      </AnimatePresence>

      {/* -- Add Modal -- */}
      <AnimatePresence>
        {showAdd && (
          <ProductFormModal
            product={null}
            categories={dbCategories}
            onSave={(data) => createProduit(data)}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
