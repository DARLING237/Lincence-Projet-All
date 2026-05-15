-- Migration complete : paiement + CamPay
-- Cette migration gère TOUS les cas (colonnes/table inexistantes)

-- 1. Table paiements (si elle n'existe pas encore)
CREATE TABLE IF NOT EXISTS paiements (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  commande_id       INT          NOT NULL,
  mode_paiement     ENUM('especes','orange_money','mtn_momo','carte','transfert') NOT NULL,
  montant           BIGINT        NOT NULL,
  reference         VARCHAR(60)   DEFAULT NULL,
  statut            ENUM('complete','partielle','remboursee') DEFAULT 'complete',
  date_paiement     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pai_cmd FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Colonne mode_paiement dans commandes
ALTER TABLE commandes ADD COLUMN mode_paiement ENUM('especes','orange_money','mtn_momo','carte','transfert') DEFAULT NULL AFTER statut;

-- 3. Colonnes CamPay sur paiements
ALTER TABLE paiements ADD COLUMN num_client VARCHAR(15) DEFAULT NULL AFTER reference;
ALTER TABLE paiements ADD COLUMN campay_reference VARCHAR(100) DEFAULT NULL AFTER num_client;
ALTER TABLE paiements ADD COLUMN campay_status VARCHAR(20) DEFAULT NULL AFTER campay_reference;
ALTER TABLE paiements ADD COLUMN campay_operator VARCHAR(20) DEFAULT NULL AFTER campay_status;

-- 4. Table solde CamPay
CREATE TABLE IF NOT EXISTS campay_solde (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  total_balance     BIGINT        NOT NULL DEFAULT 0,
  orange_balance    BIGINT        NOT NULL DEFAULT 0,
  mtn_balance       BIGINT        NOT NULL DEFAULT 0,
  currency          VARCHAR(10)   NOT NULL DEFAULT 'XAF',
  derniere_sync     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_one_row CHECK (id = 1)
) ENGINE=InnoDB;

INSERT IGNORE INTO campay_solde (id, total_balance, orange_balance, mtn_balance) VALUES (1, 0, 0, 0);
