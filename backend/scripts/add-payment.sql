-- Ajouter mode_paiement aux commandes
ALTER TABLE commandes ADD COLUMN IF NOT EXISTS mode_paiement ENUM('especes','mobile_money','carte','transfert') DEFAULT NULL AFTER statut;

-- Table paiements (historique detaille)
CREATE TABLE IF NOT EXISTS paiements (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  commande_id       INT          NOT NULL,
  mode_paiement     ENUM('especes','mobile_money','carte','transfert') NOT NULL,
  montant           BIGINT        NOT NULL,
  reference         VARCHAR(60)   DEFAULT NULL,
  statut            ENUM('complete','partielle','remboursee') DEFAULT 'complete',
  date_paiement     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pai_cmd FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;
