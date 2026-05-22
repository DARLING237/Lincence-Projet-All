const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'barrestaurant_db'
  });

  console.log('=== DÉBUT DES INSERTIONS ===\n');

  // ============================================================
  // 1. UTILISATEURS (admin déjà existant id=1, on ajoute du personnel)
  // ============================================================
  const bcrypt = require('bcryptjs');

  // Vérifier si l'admin existe déjà
  const [adminCheck] = await conn.execute('SELECT id FROM utilisateurs WHERE id = 1');
  if (adminCheck.length === 0) {
    const hashAdmin = await bcrypt.hash('admin123', 10);
    await conn.execute(
      `INSERT INTO utilisateurs (id, nom, prenom, email, mot_de_passe, role, poste, actif, first_login)
       VALUES (1, 'Admin', 'RestoPlus', 'admin@barresto.com', ?, 'admin', 'Administrateur', 1, 0)`,
      [hashAdmin]
    );
    console.log('✅ Admin créé');
  } else {
    console.log('ℹ️  Admin déjà existant (id=1)');
  }

  // Serveur 1
  const hashServeur1 = await bcrypt.hash('serveur1', 10);
  await conn.execute(
    `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, telephone, actif)
     VALUES ('Diallo', 'Ibrahima', 'ibra@barresto.com', ?, 'serveur', 'Serveur', '777-11-22-11', 1)`,
    [hashServeur1]
  );
  console.log('✅ Serveur Diallo créé');

  // Serveur 2
  const hashServeur2 = await bcrypt.hash('serveur2', 10);
  await conn.execute(
    `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, actif)
     VALUES ('Sané', 'Fatou', 'fatu@barresto.com', ?, 'serveur', 'Serveuse', 1)`,
    [hashServeur2]
  );
  console.log('✅ Serveuse Sané créée');

  // Cuisinier
  const hashCuisinier = await bcrypt.hash('cuisine1', 10);
  await conn.execute(
    `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, actif)
     VALUES ('Ndiaye', 'Omar', 'omar@barresto.com', ?, 'cuisinier', 'Chef Cuisine', 1)`,
    [hashCuisinier]
  );
  console.log('✅ Cuisinier Ndiaye créé');

  // Manager
  const hashManager = await bcrypt.hash('manager1', 10);
  await conn.execute(
    `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, actif)
     VALUES ('Diop', 'Awa', 'awa@barresto.com', ?, 'manager', 'Manager', 1)`,
    [hashManager]
  );
  console.log('✅ Manager Diop créée');

  // Caissier
  const hashCaissier = await bcrypt.hash('caisse1', 10);
  await conn.execute(
    `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, poste, actif)
     VALUES ('Ba', 'Moussa', 'moussa@barresto.com', ?, 'caissier', 'Caissier', 1)`,
    [hashCaissier]
  );
  console.log('✅ Caissier Ba créé');

  // ============================================================
  // 2. CATEGORIES
  // ============================================================
  // Delete existing categories first to prevent key collision if needed
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  await conn.execute('TRUNCATE TABLE categories');
  
  const categories = [
    [1, 'Entrées', 'cuisine', 1],
    [2, 'Plats principaux', 'cuisine', 2],
    [3, 'Desserts', 'cuisine', 3],
    [4, 'Boissons Restaurant', 'tous', 4],
    [5, 'Grillades', 'cuisine', 5]
  ];
  for (const [id, nom, typePoste, ordre] of categories) {
    await conn.execute(
      'INSERT INTO categories (id, nom, type_poste, ordre_affiche) VALUES (?, ?, ?, ?)',
      [id, nom, typePoste, ordre]
    );
    console.log(`✅ Catégorie "${nom}" créée`);
  }

  // ============================================================
  // 3. PRODUITS MENU
  // ============================================================
  await conn.execute('TRUNCATE TABLE produits_menu');
  const produits = [
    // Entrées (cat 1)
    [1, 1, 'Salade Niçoise', 'Salade fraîcheur au thon, olives et oeuf dur', 4000, 'cuisine', 1, null],
    [2, 1, 'Bouillon de boeuf', 'Soupe épicée de boeuf locale parfumée', 3500, 'cuisine', 0, null],
    // Plats (cat 2)
    [5, 2, 'Poulet DG', 'Poulet entier rôti avec riz, plantains mûrs et poivrons', 8000, 'cuisine', 1, null],
    [6, 2, 'Ndole Viande', 'Ndole traditionnel avec viande de boeuf tendre', 7000, 'cuisine', 0, null],
    [20, 2, 'Poisson Braisé', 'Thiof braisé entier avec frites de plantain', 12000, 'cuisine', 1, null],
    [21, 2, 'Ero', 'Plat traditionnel à base de feuilles d\'ero et boeuf', 5000, 'cuisine', 0, null],
    // Boissons (cat 4)
    [3, 4, 'Coca-Cola', 'Boisson gazeuse rafraîchissante 33cl', 1000, 'tous', 1, null],
    [4, 4, 'Sprite', 'Boisson gazeuse citron-lime 33cl', 1000, 'tous', 0, null],
    [15, 4, 'Eau Minérale', 'Bouteille d\'eau minérale plate 1.5L', 800, 'tous', 1, null],
    [16, 4, 'Jus d\'orange', 'Jus d\'orange frais pressé minute', 1500, 'tous', 0, null],
    [17, 4, 'Fanta', 'Boisson gazeuse à l\'orange 33cl', 1000, 'tous', 0, null],
    [18, 4, 'Jus de Bissap', 'Jus de bissap maison infusé à la menthe', 1000, 'tous', 0, null],
    [19, 4, 'Jus de Gingembre', 'Jus de gingembre frais fait maison', 1000, 'tous', 0, null],
    // Desserts (cat 3)
    [7, 3, 'Crème brûlée', 'Dessert classique à la vanille de Penja caramélisée', 3000, 'cuisine', 0, null],
    [22, 3, 'Glace Vanille', '2 boules de glace vanille premium et coulis', 2500, 'cuisine', 0, null],
    [24, 3, 'Dame-blanche', 'Glaces vanille avec chocolat chaud et chantilly', 2500, 'cuisine', 0, null],
    // Grillades (cat 5)
    [23, 5, 'Brochettes de filet', 'Brochettes de filet de boeuf grillées (la portion)', 6000, 'cuisine', 0, null]
  ];

  for (const [id, catId, nom, desc, prix, typePoste, bestseller, photo] of produits) {
    await conn.execute(
      'INSERT INTO produits_menu (id, categorie_id, nom, description, prix, type_poste, dispo, bestseller, photo) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)',
      [id, catId, nom, desc, prix, typePoste, bestseller || 0, photo || null]
    );
  }
  console.log(`✅ ${produits.length} produits menu créés`);

  // ============================================================
  // 4. PRODUITS STOCK
  // ============================================================
  await conn.execute('TRUNCATE TABLE produits_stock');
  const stockItems = [
    [1, 'Oignons Blancs', 'Kg', 30.00, 10.00],
    [2, 'Ail séché', 'Kg', 10.00, 2.00],
    [3, 'Gingembre frais', 'Kg', 12.00, 3.00],
    [4, 'Poivrons multicolores', 'Kg', 15.00, 3.00],
    [5, 'Poulet entier (Frais)', 'Kg', 45.00, 10.00],
    [6, 'Plantain Mûr (Regimes)', 'Regime', 12.00, 3.00],
    [13, 'Crevettes roses', 'Kg', 20.00, 5.00],
    [14, 'Beurre doux', 'Kg', 15.00, 4.00],
    [15, 'Poisson Bar (Frais)', 'Kg', 35.00, 8.00],
    [16, 'Filet de Boeuf', 'Kg', 28.00, 5.00],
    [17, 'Tomates Fraîches', 'Kg', 50.00, 15.00],
    [18, 'Carottes', 'Kg', 30.00, 10.00],
    [20, 'Pommes de terre', 'Kg', 40.00, 10.00],
    [21, 'Sac de Riz Parfumé (25kg)', 'Sac', 5.00, 1.00],
    [22, 'Huile de Palme Raffinée', 'Litre', 40.00, 10.00],
    [23, 'Feuilles d\'Ero (Séchées)', 'Kg', 15.00, 3.00],
    [24, 'Thon en conserve (1kg)', 'Boite', 12.00, 3.00],
    [25, 'Oeufs frais (Alvéoles)', 'Alveole', 10.00, 2.00],
    [26, 'Crème fraîche liquide', 'Litre', 10.00, 2.00],
    [27, 'Sel fin', 'Kg', 10.00, 2.00],
    [28, 'Poivre moulu', 'Kg', 5.00, 1.00],
    [29, 'Sucre en poudre', 'Kg', 20.00, 5.00],
  ];

  for (const [id, nom, unite, stock, min] of stockItems) {
    await conn.execute(
      'INSERT INTO produits_stock (id, nom, unite, stock_actuel, stock_min, alerte, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
      [id, nom, unite, stock, min]
    );
  }
  console.log(`✅ ${stockItems.length} produits stock créés`);

  // ============================================================
  // 5. RECETTES
  // ============================================================
  await conn.execute('TRUNCATE TABLE recettes');
  const recettes = [
    [1, 24, 0.1500], // Salade Niçoise uses Thon
    [1, 25, 0.0600], // Salade Niçoise uses Oeufs
    [1, 17, 0.1000], // Salade Niçoise uses Tomates
    [1, 18, 0.0500], // Salade Niçoise uses Carottes
    [2, 16, 0.3000], // Bouillon uses Boeuf
    [2, 1, 0.0500],  // Bouillon uses Oignons
    [5, 5, 0.5000],  // Poulet DG uses Poulet
    [5, 6, 0.2500],  // Poulet DG uses Plantain
    [5, 17, 0.1500], // Poulet DG uses Tomates
    [5, 18, 0.1000], // Poulet DG uses Carottes
    [5, 22, 0.0500], // Poulet DG uses Huile
    [6, 16, 0.3500], // Ndole uses Boeuf
    [6, 18, 0.1000], // Ndole uses Carottes
    [6, 22, 0.0800], // Ndole uses Huile
    [20, 15, 1.0000], // Poisson Braisé uses Poisson Bar
    [20, 6, 0.2000],  // Poisson Braisé uses Plantain
    [20, 22, 0.0500], // Poisson Braisé uses Huile
    [21, 23, 0.2500], // Ero uses Feuilles d'Ero
    [21, 22, 0.1000], // Ero uses Huile
    [23, 16, 0.3000], // Brochettes uses Boeuf
    [7, 26, 0.1500],  // Crème brûlée uses Crème fraîche
    [7, 25, 0.0600],  // Crème brûlée uses Oeufs
    [7, 29, 0.0300],  // Crème brûlée uses Sucre
  ];

  for (const [prodMenuId, prodStockId, qte] of recettes) {
    await conn.execute(
      'INSERT INTO recettes (produit_menu_id, produit_stock_id, quantite_requise) VALUES (?, ?, ?)',
      [prodMenuId, prodStockId, qte]
    );
  }
  console.log(`✅ ${recettes.length} recettes créées`);

  // ============================================================
  // 6. TABLES SALLE
  // ============================================================
  await conn.execute('TRUNCATE TABLE tables_salle');
  const tables = [
    [1, 'T1', 2, 'Terrasse'],
    [2, 'T2', 4, 'Terrasse'],
    [3, 'T3', 6, 'Interieur'],
    [4, 'T4', 4, 'Interieur'],
    [5, 'VIP1', 8, 'VIP'],
    [11, 'T5', 2, 'Interieur'],
    [12, 'T6', 4, 'Interieur'],
    [13, 'VIP2', 10, 'VIP'],
    [14, 'BALCON1', 4, 'Balcon'],
    [15, 'BALCON2', 4, 'Balcon'],
  ];
  for (const [id, num, places, zone] of tables) {
    await conn.execute(
      'INSERT INTO tables_salle (id, numero, places, zone, statut, qr_actif) VALUES (?, ?, ?, ?, "libre", 1)',
      [id, num, places, zone]
    );
  }
  console.log(`✅ ${tables.length} tables créées`);

  // ============================================================
  // 7. FOURNISSEURS
  // ============================================================
  await conn.execute('TRUNCATE TABLE fournisseurs');
  const fournisseurs = [
    [1, 'Société des Eaux et Boissons (SEB)', '699000000', 'contact@seb.cm', 'Douala, Cameroun', 'Boissons & Softs'],
    [2, 'Boucherie Centrale de Yaoundé', '677000000', 'viande@boucherie.cm', 'Yaoundé, Marché Central', 'Viandes & Volailles'],
    [3, 'Poissonnerie du Port de Douala', '688000000', 'peche@port.cm', 'Quai de Pêche, Douala', 'Poissons & Fruits de mer'],
    [4, 'Marché Vivrier du Mfoundi', '655000000', 'frais@mfoundi.cm', 'Secteur vivrier, Yaoundé', 'Légumes, Épices & Fruits'],
    [5, 'Grossiste Alimentaire SOCOPRAL', '699112233', 'info@socopral.cm', 'Zone Industrielle, Bassa', 'Produits Secs & Huiles']
  ];

  for (const [id, nom, contact, email, adresse, type] of fournisseurs) {
    await conn.execute(
      'INSERT INTO fournisseurs (id, nom, contact, email, adresse, type, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [id, nom, contact, email, adresse, type]
    );
  }
  console.log(`✅ ${fournisseurs.length} fournisseurs créés`);

  // ============================================================
  // 8. COMMANDE (avec items et paiement — test de bout en bout)
  // ============================================================
  await conn.execute('TRUNCATE TABLE commandes');
  const [serveurs] = await conn.execute('SELECT id FROM utilisateurs WHERE role = "serveur" ORDER BY id LIMIT 1');
  const serveurId = serveurs[0].id;

  // Commande 1 (payée)
  await conn.execute(
    `INSERT INTO commandes (id, table_id, serveur_id, total, heure, date, statut, mode_paiement, source)
     VALUES (1, 1, ?, 7000, '12:30:00', '2026-05-15', "payee", "especes", "staff")`,
    [serveurId]
  );
  console.log(`✅ Commande #1 créée (payée)`);

  // Commande 2 (servie)
  await conn.execute(
    `INSERT INTO commandes (id, table_id, serveur_id, total, heure, date, statut, mode_paiement, source)
     VALUES (2, 3, ?, 17000, '13:00:00', '2026-05-15', "servie", NULL, "staff")`,
    [serveurId]
  );
  console.log(`✅ Commande #2 créée (servie)`);

  // Commande 3 (servie de QR)
  await conn.execute(
    `INSERT INTO commandes (id, table_id, serveur_id, total, heure, date, statut, mode_paiement, source, note)
     VALUES (3, 14, ?, 12000, '16:33:38', '2026-05-15', "servie", NULL, "qr_client", "Commande table BALCON1")`,
    [serveurId]
  );
  console.log(`✅ Commande #3 créée (servie)`);

  // ============================================================
  // 9. COMMANDE_ITEMS
  // ============================================================
  await conn.execute('TRUNCATE TABLE commande_items');
  const items = [
    [1, 1, 1, 1, 4000, 'cuisine', 'servi'],
    [2, 1, 3, 1, 1000, 'tous', 'servi'],
    [3, 2, 5, 2, 8000, 'cuisine', 'en preparation'],
    [4, 2, 4, 1, 1000, 'tous', 'pret'],
    [5, 3, 20, 1, 12000, 'cuisine', 'servi']
  ];
  for (const [id, cmdId, prodId, qty, prix, typePoste, statut] of items) {
    await conn.execute(
      'INSERT INTO commande_items (id, commande_id, produit_menu_id, quantite, prix_unitaire, type_poste, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, cmdId, prodId, qty, prix, typePoste, statut]
    );
  }
  console.log(`✅ ${items.length} items de commande créés`);

  // ============================================================
  // 10. PAIEMENTS
  // ============================================================
  await conn.execute('TRUNCATE TABLE paiements');
  await conn.execute(
    'INSERT INTO paiements (commande_id, mode_paiement, montant, reference, statut) VALUES (1, "especes", 7000, "ESPECE-001", "complete")'
  );
  console.log(`✅ Paiement créé pour commande #1`);

  // ============================================================
  // 11. TRANSACTIONS
  // ============================================================
  await conn.execute('TRUNCATE TABLE transactions');
  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, description, date)
     VALUES ("entree", "Vente", 7000, "Paiement Commande #1", "2026-05-15")`
  );
  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, description, date)
     VALUES ("sortie", "Achat Stock", 180000, "Paiement Facture Boissons SEB", "2026-05-14")`
  );
  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, description, date)
     VALUES ("sortie", "Achat Stock", 250000, "Paiement Facture Viandes", "2026-05-14")`
  );
  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, description, date)
     VALUES ("sortie", "Achat Stock", 120000, "Paiement Facture Poissons", "2026-05-15")`
  );
  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, description, date)
     VALUES ("sortie", "Achat Stock", 75000, "Paiement Facture Légumes", "2026-05-15")`
  );
  console.log('✅ Transactions créées');

  // ============================================================
  // 12. STOCKS INITIAUX (mouvements_stock + inventaires)
  // ============================================================
  await conn.execute('TRUNCATE TABLE mouvements_stock');
  const movements = [
    [1, 5, 'sortie', 1.00, 'Commande produit_menu_id #5', 2],
    [2, 6, 'sortie', 0.50, 'Commande produit_menu_id #5', 2],
    [3, 17, 'sortie', 0.30, 'Commande produit_menu_id #5', 2],
    [4, 15, 'sortie', 1.00, 'Commande produit_menu_id #20', 3],
    [5, 6, 'sortie', 0.20, 'Commande produit_menu_id #20', 3]
  ];
  for (const [id, stockId, type, qte, raison, refId] of movements) {
    await conn.execute(
      'INSERT INTO mouvements_stock (id, produit_stock_id, type, quantite, raison, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?, "commande")',
      [id, stockId, type, qte, raison, refId]
    );
  }
  console.log(`✅ ${movements.length} mouvements de stock initiaux`);

  await conn.execute('TRUNCATE TABLE inventaires');
  for (const s of stockItems) {
    await conn.execute(
      'INSERT INTO inventaires (produit_stock_id, stock_theorique, stock_reel, ecart, date_inventaire) VALUES (?, 0, 0, 0, CURDATE())',
      [s[0]]
    );
  }
  console.log(`✅ ${stockItems.length} inventaires initiaux`);

  // ============================================================
  // 13. RAVITAILLEMENTS
  // ============================================================
  await conn.execute('TRUNCATE TABLE ravitaillements');
  const ravits = [
    [1, 1, '2026-05-14', 180000, 'FAC-SEB-099'],
    [2, 2, '2026-05-14', 250000, 'FAC-BOUCH-012'],
    [3, 3, '2026-05-15', 120000, 'FAC-PECHE-488'],
    [4, 4, '2026-05-15', 75000, 'FAC-MFOUN-23']
  ];
  for (const [id, fournId, date, mont, fac] of ravits) {
    await conn.execute(
      'INSERT INTO ravitaillements (id, fournisseur_id, date, montant, nb_facture, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, fournId, date, mont, fac]
    );
  }
  console.log(`✅ Ravitaillements créés`);

  // Détails ravitaillement
  await conn.execute('TRUNCATE TABLE ravitaillement_details');
  const details = [
    [1, 1, 3, 12.00, 12000],
    [2, 1, 4, 15.00, 15000],
    [3, 2, 5, 20.00, 70000],
    [4, 2, 16, 15.00, 180000],
    [5, 3, 15, 35.00, 120000],
    [6, 4, 6, 8.00, 40000],
    [7, 4, 17, 30.00, 20000],
    [8, 4, 18, 15.00, 15000]
  ];
  for (const [id, ravId, stockId, qty, prix] of details) {
    await conn.execute(
      'INSERT INTO ravitaillement_details (id, ravitaillement_id, produit_stock_id, quantite, prix) VALUES (?, ?, ?, ?, ?)',
      [id, ravId, stockId, qty, prix]
    );
  }
  console.log('✅ Détails ravitaillements créés');

  // ============================================================
  // 14. SALAIRES
  // ============================================================
  await conn.execute('TRUNCATE TABLE salaires');
  await conn.execute(
    'INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (2, "2026-05", 150000, "en attente", "2026-05-15")'
  );
  await conn.execute(
    'INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (3, "2026-05", 200000, "en attente", "2026-05-15")'
  );
  console.log('✅ Salaires créés');

  // ============================================================
  // 15. PRÉSENCES
  // ============================================================
  await conn.execute('TRUNCATE TABLE presences');
  await conn.execute(
    `INSERT INTO presences (personnel_id, date_connexion, heure_connexion, date, statut, ip_address, session_id)
     VALUES (?, NOW() - INTERVAL 2 HOUR, CURTIME() - INTERVAL 2 HOUR, CURDATE(), "present", "127.0.0.1", "seed-session-001")`,
    [serveurId]
  );
  console.log('✅ Présence créée');

  // ============================================================
  // 16. IMPOTS & TAXES
  // ============================================================
  await conn.execute('TRUNCATE TABLE impots_taxes');
  await conn.execute(
    `INSERT INTO impots_taxes (libelle, montant, echeance, statut, created_at) VALUES ("Taxe municipale", 50000, CURDATE() + INTERVAL 30 DAY, "impaye", NOW())`
  );
  await conn.execute(
    `INSERT INTO impots_taxes (libelle, montant, echeance, statut, created_at) VALUES ("TVA", 25000, CURDATE() + INTERVAL 30 DAY, "impaye", NOW())`
  );
  console.log('✅ Impôts/taxes créés');

  // ============================================================
  // 17. CAMPAY SOLDE
  // ============================================================
  await conn.execute('TRUNCATE TABLE campay_solde');
  await conn.execute('INSERT INTO campay_solde (id, total_balance, orange_balance, mtn_balance, currency) VALUES (1, 0, 0, 0, "XAF")');
  console.log('✅ Solde Campay initialisé');

  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('\n✅ Base de données initialisée avec succès !');
  await conn.end();
})().catch(e => { console.error(e); process.exit(1); });