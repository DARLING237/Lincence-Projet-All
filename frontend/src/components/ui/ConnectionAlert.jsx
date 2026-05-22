import { motion } from "framer-motion";
import { AlertTriangle, Clock, User } from "lucide-react";
import { Badge } from "./badge";

export function ConnectionAlert({ connection }) {
  const dureeEnMinutes = Math.round((connection.duree_session || 0) / 60);
  const estLongue = dureeEnMinutes > 60; // Plus d'une heure

  if (!estLongue) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-red-500">Session anormalement longue</h4>
            <Badge variant="error">Alerte</Badge>
          </div>
          <p className="text-xs font-medium text-zinc-300 mb-2">
            La session de {connection.utilisateur_nom} a duré {dureeEnMinutes} minutes
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock size={14} />
              <span>Durée: {dureeEnMinutes} min</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <User size={14} />
              <span>Rôle: {connection.utilisateur_role}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}