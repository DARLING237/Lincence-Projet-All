import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  BookOpen, Plus, Search, Camera, Star, Pencil, ToggleLeft, ToggleRight, Filter, Layers, X, CheckCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

function ProductFormModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(() => product || {
    nom: "", prix: 0, categorie_id: 1, type_poste: "bar",
    desc: "", bestseller: false, dispo: true,
    photo: null,
  });
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[520px] bg-[#1A1714] rounded-2xl shadow-2xl z-50">
        <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
          <h3 className="text-lg font-bold text-lounge-100">{product ? "Modifier le produit" : "Nouveau produit"}</h3>
          <button onClick={onClose} className="text-lounge-400 hover:text-lounge-300"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-lounge-200 block mb-1">Nom du produit</label>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="h-9 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-lounge-200 block mb-1">Prix (F CFA)</label>
              <input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: +e.target.value })}
                className="h-9 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-lounge-200 block mb-1">Categorie</label>
              <select value={form.categorie_id} onChange={(e) => setForm({ ...form, categorie_id: +e.target.value })}
                className="h-9 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30">
                <option value={1}>Cocktails</option>
                <option value={2}>Bieres</option>
                <option value={3}>Vins &amp; Spiritueux</option>
                <option value={4}>Softs &amp; Jus</option>
                <option value={5}>Eaux</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-lounge-200 block mb-1">Type</label>
              <select value={form.type_poste} onChange={(e) => setForm({ ...form, type_poste: e.target.value })}
                className="h-9 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30">
                <option value="bar">Bar</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-lounge-200 block mb-1">Best-seller</label>
              <button onClick={() => setForm({ ...form, bestseller: !form.bestseller })}
                className="flex items-center gap-1 mt-1 text-sm cursor-pointer">
                {form.bestseller ? <ToggleRight size={20} className="text-[#D4A853]" /> : <ToggleLeft size={20} className="text-lounge-500" />}
                <span className={form.bestseller ? "text-[#D4A853]" : "text-lounge-500"}>
                  {form.bestseller ? "Oui" : "Non"}
                </span>
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-lounge-200 block mb-1">Disponible</label>
              <button onClick={() => setForm({ ...form, dispo: !form.dispo })}
                className="flex items-center gap-1 mt-1 text-sm cursor-pointer">
                {form.dispo ? <ToggleRight size={20} className="text-[#D4A853]" /> : <ToggleLeft size={20} className="text-lounge-500" />}
                <span className={form.dispo ? "text-[#D4A853]" : "text-lounge-500"}>
                  {form.dispo ? "Oui" : "Non"}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-lounge-200 block mb-1">Description</label>
            <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2}
              className="w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] px-3 py-2 text-sm text-lounge-100 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30" />
          </div>
          {/* Photo upload — stores a File object, not base64 */}
          <div>
            <label className="text-sm font-medium text-lounge-200 block mb-1">Photo</label>
            <div className="flex items-center gap-3">
              {form.photo instanceof File ? (
                <img src={URL.createObjectURL(form.photo)} alt="Apercu" className="h-16 w-16 rounded-xl object-cover border border-[#D4A853]/15" />
              ) : product && product.photo ? (
                <img src={`http://${window.location.hostname}:3000${product.photo}`} alt="Actuelle" className="h-16 w-16 rounded-xl object-cover border border-[#D4A853]/15" />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-[#2E2822] border border-dashed border-[#D4A853]/8 flex items-center justify-center">
                  <Camera size={20} className="text-lounge-400" />
                </div>
              )}
              <label className="h-9 px-3 rounded-xl border border-[#D4A853]/10 bg-[#231F1B] text-lounge-300 hover:bg-[#2E2822] text-xs font-medium flex items-center cursor-pointer transition-colors">
                Choisir...
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, photo: file });
                  }} />
              </label>
            </div>
          </div>
          <button onClick={() => { onSave(form); onClose(); }}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-medium shadow-lg shadow-[#D4A853]/20">
            {product ? "Modifier" : "Ajouter"}
          </button>
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

  useEffect(() => {
    fetchProduits();
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
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-lounge-100">Menu</h1>
          <p className="text-sm text-lounge-400">Gestion des produits et categories</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-medium shadow-lg shadow-[#D4A853]/20">
          <Plus size={16} />
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
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="show" className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-lounge-400">{s.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#231F1B]">
                <s.icon size={14} className="text-lounge-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-lounge-100">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lounge-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="h-9 w-full rounded-lg border border-[#D4A853]/15 bg-[#1A1714] pl-10 pr-3 text-sm text-lounge-100 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30" />
        </div>
        <div className="flex gap-2">
          <button key="all" onClick={() => setFilterCat("Tout")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterCat === "Tout" ? "bg-[#D4A853] text-lounge-950" : "bg-[#231F1B] border border-[#D4A853]/10 text-lounge-300"}`}>
            Tout
          </button>
          {categories.map((cat, i) => (
            <button key={`${cat}-${i}`} onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? "bg-[#D4A853] text-lounge-950" : "bg-[#231F1B] border border-[#D4A853]/10 text-lounge-300"}`}>
              {cat}
            </button>
          ))}
        </div>
        <button onClick={() => setShowBest(!showBest)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${showBest ? "bg-[#D4A853] text-lounge-950" : "bg-[#231F1B] border border-[#D4A853]/10 text-lounge-300"}`}>
          <Star size={12} className={showBest ? "fill-white" : "text-[#D4A853]"} />
          Best-sellers
        </button>
      </div>

      {/* Invisible upload helper — dynamically attached per product click */}

      {/* Products Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((prod, idx) => (
          <motion.div key={prod.id != null ? `${prod.id}-${prod.nom}` : idx} variants={itemVariants}
            className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image area — click to upload */}
            <div
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => handlePhotoUpload(e, prod.id);
                input.click();
              }}
              className={`h-32 relative bg-gradient-to-br flex items-center justify-center cursor-pointer ${prod.dispo ? "from-[#231F1B] to-[#2E2822]" : "from-red-500/5 to-red-500/10"}`}
            >
              {uploadingId === prod.id ? (
                <span className="text-xs text-lounge-400">Chargement...</span>
              ) : prod.photo ? (
                <>
                  <img src={imageUrl(prod.photo)} alt={prod.nom} className="h-full w-full object-cover" />
                  <button title="Supprimer photo"
                    onClick={(e) => { e.stopPropagation(); deleteProduitPhoto(prod.id); }}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 text-lounge-400">
                  <span className="text-xs font-medium">Cliquer pour ajouter</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {prod.bestseller && <Star size={12} className="text-[#D4A853] fill-amber-500" />}
                    <h3 className="text-sm font-semibold text-lounge-100 truncate">{prod.nom}</h3>
                  </div>
                  <p className="text-xs text-lounge-400 mt-0.5 line-clamp-1">{prod.description}</p>
                </div>
                <button onClick={() => setEditForm(prod)} className="text-lounge-400 hover:text-lounge-300 flex-shrink-0 ml-2">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-base font-bold text-lounge-100">{formatMontant(prod.prix)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleBestseller(prod.id, prod.bestseller)}
                    className="flex items-center gap-1 text-xs cursor-pointer">
                    {prod.bestseller ? <ToggleRight size={20} className="text-[#D4A853]" /> : <ToggleLeft size={20} className="text-lounge-500" />}
                  </button>
                  <button onClick={() => updateProduit(prod.id, { dispo: !prod.dispo })}
                    className="flex items-center gap-1 text-xs cursor-pointer">
                    {prod.dispo ? <ToggleRight size={20} className="text-[#D4A853]" /> : <ToggleLeft size={20} className="text-lounge-500" />}
                    <span className={`font-medium ${prod.dispo ? "text-[#D4A853]" : "text-lounge-500"}`}>
                      {prod.dispo ? "Dispo" : "Indispo"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 bg-[#D4A853]/5 rounded-full px-2 py-0.5 text-[10px] font-medium text-lounge-400">
                  {prod.type_poste || prod.categorie_type || "bar"}
                </span>
                <span className="bg-[#D4A853]/10 text-[#D4A853] rounded-full px-2 py-0.5 text-[10px] font-medium">{prod.categorie_nom || prod.categorie || "—"}</span>
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
            onSave={(data) => createProduit(data)}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
