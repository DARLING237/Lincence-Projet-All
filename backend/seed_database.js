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
       VALUES (1, 'Admin', 'BarResto', 'admin@barresto.com', ?, 'admin', 'Administrateur', 1, 0)`,
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
  const categories = [
    ['Entrées', 'cuisine', 1],
    ['Plats', 'cuisine', 2],
    ['Boissons', 'bar', 3],
    ['Desserts', 'cuisine', 4],
    ['Grillades', 'cuisine', 5]
  ];
  for (const [nom, typePoste, ordre] of categories) {
    await conn.execute(
      'INSERT INTO categories (nom, type_poste, ordre_affiche) VALUES (?, ?, ?)',
      [nom, typePoste, ordre]
    );
    console.log(`✅ Catégorie "${nom}" créée`);
  }

  // ============================================================
  // 3. PRODUITS MENU
  // ============================================================
  const produits = [
    // Entrées (cat 1)
    ['Salade Verte', 'Salade fraîche avec tomates et oignons', 2500, 'cuisine', 1, 0, 'salade.jpg'],
    ['Samoussas x6', 'Samoussas viande ou poulet', 3000, 'cuisine', 1, 1, 'samoussas.jpg'],
    ['Beignets de poisson x6', 'Beignets de poisson frit avec sauce', 3500, 'cuisine', 1, 0, 'beignets.jpg'],
    // Plats (cat 2)
    ['Poulet rôti', 'Poulet entier rôti avec riz et salade', 6500, 'cuisine', 2, 1, 'poulet.jpg'],
    ['Poisson braisé', 'Thiof braisé avec riz et légumes', 7500, 'cuisine', 2, 1, 'poisson.jpg'],
    ['Riz au poulet', 'Riz sauté au poulet et légumes', 4500, 'cuisine', 2, 0, 'riz_poulet.jpg'],
    ['Yassa poulet', 'Poulet yassa traditionnel avec riz', 5500, 'cuisine', 2, 0, 'yassa.jpg'],
    ['Mafé viande', 'Mafé de bœuf avec riz', 6000, 'cuisine', 2, 0, 'mafe.jpg'],
    // Grillades (cat 5)
    ['Brochettes x6', 'Brochettes de viande au choix', 2500, 'cuisine', 5, 1, 'brochettes.jpg'],
    ['Côtes d\'agneau grillées', 'Côtes d\'agneau marinées et grillées', 8000, 'cuisine', 5, 0, 'agneau.jpg'],
    // Boissons (cat 3)
    ['Coca-Cola 33cl', 'Coca-Cola original', 500, 'bar', 3, 0, 'coca.jpg'],
    ['Sprite 33cl', 'Sprite citron', 500, 'bar', 3, 0, 'sprite.jpg'],
    ['Bock bière', 'Bière locale', 500, 'bar', 3, 1, 'biere.jpg'],
    ['Flag bière', 'Flag bière', 600, 'bar', 3, 0, 'flag.jpg'],
    ['Jus d\'orange', 'Jus d\'orange frais', 800, 'bar', 3, 1, 'jus_orange.jpg'],
    ['Bissap', 'Jus de bissap maison', 600, 'bar', 3, 1, 'bissap.jpg'],
    ['Gingembre', 'Jus de gingembre frais', 500, 'bar', 3, 0, 'gingembre.jpg'],
    ['Café Touba', 'Café sénégalais traditionnel', 400, 'bar', 3, 0, 'cafe.jpg'],
    ['Thé à la menthe', 'Thé menthe traditionnel', 400, 'bar', 3, 0, 'the.jpg'],
    // Desserts (cat 4)
    ['Gâteau à la vanille', 'Part de gâteau vanille', 1500, 'cuisine', 4, 0, 'gateau.jpg'],
    ['Crème glacée', 'Boule de glace au choix', 1000, 'cuisine', 4, 1, 'glace.jpg'],
    ['Dame-blanche', 'Dessert yaourt et sucre', 800, 'cuisine', 4, 0, 'dame_blanche.jpg'],
  ];

  for (const [nom, desc, prix, typePoste, catId, bestseller, photo] of produits) {
    await conn.execute(
      'INSERT INTO produits_menu (categorie_id, nom, description, prix, type_poste, dispo, bestseller, photo) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
      [catId, nom, desc, prix, typePoste, bestseller, photo]
    );
  }
  console.log(`✅ ${produits.length} produits menu créés`);

  // ============================================================
  // 4. PRODUITS STOCK
  // ============================================================
  const stockItems = [
    ['Poulet entier', 'kg', 50, 10],
    ['Poisson frais (Thiof)', 'kg', 30, 8],
    ['Bœuf', 'kg', 40, 10],
    ['Riz étuvé', 'kg', 100, 20],
    ['Riz brisé', 'kg', 80, 15],
    ['Huile d\'arachide', 'L', 25, 5],
    ['Oignons', 'kg', 20, 5],
    ['Tomates', 'kg', 15, 5],
    ['Citrons', 'kg', 10, 3],
    ['Pastèques/Mangues', 'kg', 20, 8],
    ['Lait concentré', 'L', 15, 5],
    ['Sucre', 'kg', 30, 10],
    ['Café Touba', 'kg', 5, 2],
    ['Thé vert', 'kg', 3, 1],
    ['Coca-Cola (pack 24)', 'unité', 20, 5],
    ['Sprite (pack 24)', 'unité', 15, 3],
    ['Bock bière (pack)', 'unité', 30, 10],
    ['Flag bière (pack)', 'unité', 15, 5],
    ['Bissap (concentré)', 'L', 10, 3],
    ['Gingembre', 'kg', 5, 2],
  ];

  for (const [nom, unite, stock, min] of stockItems) {
    await conn.execute(
      'INSERT INTO produits_stock (nom, unite, stock_actuel, stock_min, alerte, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [nom, unite, stock, min]
    );
  }
  console.log(`✅ ${stockItems.length} produits stock créés`);

  // ============================================================
  // 5. TABLES SALLE
  // ============================================================
  const tables = [
    ['1', 4, 'Terrasse'],
    ['2', 4, 'Terrasse'],
    ['3', 2, 'Terrasse'],
    ['4', 4, 'Salle principale'],
    ['5', 4, 'Salle principale'],
    ['6', 6, 'Salle principale'],
    ['7', 2, 'Salle principale'],
    ['8', 4, 'Salle principale'],
    ['VIP', 8, 'VIP'],
    ['VIP2', 6, 'VIP'],
  ];
  for (const [num, places, zone] of tables) {
    await conn.execute(
      'INSERT INTO tables_salle (numero, places, zone, statut, qr_actif) VALUES (?, ?, ?, "libre", 1)',
      [num, places, zone]
    );
  }
  console.log(`✅ ${tables.length} tables créées`);

  // ============================================================
  // 6. FOURNISSEURS
  // ============================================================
  const fournisseurs = [
    ['Marché Deuz', '771-00-00-01', 'm@marche.sn', 'Marché Sandaga, Dakar', 'alimentaire'],
    ['Boissons Plus', '772-00-00-02', 'bp@boissons.sn', 'Avenue Blaise Diagne', 'boissons'],
    ['Épicerie Faye', '773-00-00-03', 'ef@epicerie.sn', 'Rue 10, Dakar', 'alimentaire'],
    ['Volaille Ndaw', '774-00-00-04', 'vn@volaille.sn', 'Guediawaye', 'viande'],
    ['Poissonnerie Ndiaye', '775-00-00-05', 'pn@poisson.sn', 'Hann, Dakar', 'poisson'],
  ];

  for (const [nom, contact, email, adresse, type] of fournisseurs) {
    await conn.execute(
      'INSERT INTO fournisseurs (nom, contact, email, adresse, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [nom, contact, email, adresse, type]
    );
  }
  console.log(`✅ ${fournisseurs.length} fournisseurs créés`);

  // ============================================================
  // 7. COMMANDE (avec items et paiement — test de bout en bout)
  // ============================================================
  // Insertion d'une commande
  const [serveurs] = await conn.execute('SELECT id FROM utilisateurs WHERE role = "serveur" ORDER BY id LIMIT 1');
  const serveurId = serveurs[0].id;

  await conn.execute(
    `INSERT INTO commandes (table_id, serveur_id, total, date, statut, mode_paiement, source)
     VALUES (1, ?, 0, CURDATE(), "en attente", NULL, "staff")`,
    [serveurId]
  );
  const [commandeResult] = await conn.execute('SELECT LAST_INSERT_ID() as id');
  const commandeId = commandeResult[0].id;
  console.log(`✅ Commande #${commandeId} créée`);

  // Créer une 2e commande (payée, pour avoir du CA)
  await conn.execute(
    `INSERT INTO commandes (table_id, serveur_id, total, heure, date, statut, mode_paiement, source)
     VALUES (4, ?, 0, CURTIME(), CURDATE(), "en attente", NULL, "staff")`,
    [serveurId]
  );
  const [cmd2Result] = await conn.execute('SELECT LAST_INSERT_ID() as id');
  const commande2Id = cmd2Result[0].id;

  // ============================================================
  // 8. COMMANDE_ITEMS
  // ============================================================
  // Récupérer les IDs des produits
  const [produitRows] = await conn.execute('SELECT id, nom, prix FROM produits_menu ORDER BY id');
  const produitMap = {};
  for (const p of produitRows) {
    produitMap[p.nom] = { id: p.id, prix: parseFloat(p.prix) };
  }

  // Items pour commande 1
  const itemsCmd1 = [
    { nom: 'Salade Verte', qty: 1 },
    { nom: 'Poulet rôti', qty: 2 },
    { nom: 'Coca-Cola 33cl', qty: 2 },
    { nom: 'Jus d\'orange', qty: 1 },
  ];

  let totalCmd1 = 0;
  for (const item of itemsCmd1) {
    const p = produitMap[item.nom];
    const prixTotal = parseFloat((p.prix * item.qty).toFixed(2));
    totalCmd1 += prixTotal;
    await conn.execute(
      'INSERT INTO commande_items (commande_id, produit_menu_id, quantite, prix_unitaire, type_poste, statut) VALUES (?, ?, ?, ?, "cuisine", "servi")',
      [commandeId, p.id, item.qty, p.prix]
    );
  }
  console.log(`✅ ${itemsCmd1.length} items ajoutés à la commande #${commandeId}`);

  // Items pour commande 2
  const itemsCmd2 = [
    { nom: 'Samoussas x6', qty: 1 },
    { nom: 'Poisson braisé', qty: 1 },
    { nom: 'Bock bière', qty: 3 },
    { nom: 'Dame-blanche', qty: 2 },
  ];

  let totalCmd2 = 0;
  for (const item of itemsCmd2) {
    const p = produitMap[item.nom];
    const prixTotal = parseFloat((p.prix * item.qty).toFixed(2));
    totalCmd2 += prixTotal;
    await conn.execute(
      'INSERT INTO commande_items (commande_id, produit_menu_id, quantite, prix_unitaire, type_poste, statut) VALUES (?, ?, ?, ?, "cuisine", "servi")',
      [commande2Id, p.id, item.qty, p.prix]
    );
  }
  console.log(`✅ ${itemsCmd2.length} items ajoutés à la commande #${commande2Id}`);

  // Mise à jour des totaux
  await conn.execute('UPDATE commandes SET total=? WHERE id=?', [totalCmd1, commandeId]);
  await conn.execute('UPDATE commandes SET total=? WHERE id=?', [totalCmd2, commande2Id]);

  // ============================================================
  // 9. PAIEMENTS
  // ============================================================
  await conn.execute(
    'INSERT INTO paiements (commande_id, mode_paiement, montant, reference, statut) VALUES (?, "especes", ?, "ESPECE-001", "complete")',
    [commandeId, totalCmd1]
  );
  console.log(`✅ Paiement créé pour commande #${commandeId}: ${totalCmd1} F`);

  await conn.execute(
    'INSERT INTO paiements (commande_id, mode_paiement, montant, reference, statut) VALUES (?, "orange_money", ?, "OM-001", "complete")',
    [commande2Id, totalCmd2]
  );
  console.log(`✅ Paiement créé pour commande #${commande2Id}: ${totalCmd2} F`);

  // ============================================================
  // 10. TRANSACTIONS
  // ============================================================
  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, reference, description, date)
     VALUES ("entree", "caisse_ouverture", 100000, "COUVRE-FEU", "Ouverture de caisse", CURDATE())`
  );
  console.log('✅ Transaction caisse_ouverture créée');

  await conn.execute(
    `INSERT INTO transactions (type_op, categorie, montant, reference, description, date)
     VALUES ("sortie", "achat_produits", 25000, "ACHAT-001", "Avenue poulet et poisson", CURDATE())`
  );
  console.log('✅ Transaction achat_produits créée');

  // ============================================================
  // 11. STOCKS INITIAUX (mouvements_stock + inventaires)
  // ============================================================
  const [stockRows] = await conn.execute('SELECT id, nom FROM produits_stock ORDER BY id');
  for (const s of stockRows) {
    await conn.execute(
      'INSERT INTO mouvements_stock (produit_stock_id, type, quantite, raison, reference_id, reference_type) VALUES (?, "entree", ?, "Stock initial ouverture", NULL, NULL)',
      [s.id, s.nom.includes('pack') ? 5 : (s.nom.includes('kg') ? 20 : 10)]
    );
  }
  console.log(`✅ ${stockRows.length} mouvements de stock initiaux`);

  for (const s of stockRows) {
    await conn.execute(
      'INSERT INTO inventaires (produit_stock_id, stock_theorique, stock_reel, ecart, date_inventaire) VALUES (?, 0, 0, 0, CURDATE())',
      [s.id]
    );
  }
  console.log(`✅ ${stockRows.length} inventaires initiaux`);

  // ============================================================
  // 12. RAVITAILLEMENTS
  // ============================================================
  const [fournisseurRows] = await conn.execute('SELECT id FROM fournisseurs ORDER BY id LIMIT 1');
  const fournisseurId = fournisseurRows[0].id;

  await conn.execute(
    'INSERT INTO ravitaillements (fournisseur_id, date, montant, nb_facture, created_at) VALUES (?, CURDATE() - INTERVAL 1 DAY, 45000, "FAC-2025-001", NOW())',
    [fournisseurId]
  );
  const [ravitResult] = await conn.execute('SELECT LAST_INSERT_ID() as id');
  const ravitId = ravitResult[0].id;
  console.log(`✅ Ravitaillement #${ravitId} créé`);

  // Détails ravitaillement
  await conn.execute(
    'INSERT INTO ravitaillement_details (ravitaillement_id, produit_stock_id, quantite, prix) VALUES (?, ?, 20, 5000)',
    [ravitId, 1]
  );
  await conn.execute(
    'INSERT INTO ravitaillement_details (ravitaillement_id, produit_stock_id, quantite, prix) VALUES (?, ?, 10, 8000)',
    [ravitId, 2]
  );
  await conn.execute(
    'INSERT INTO ravitaillement_details (ravitaillement_id, produit_stock_id, quantite, prix) VALUES (?, ?, 50, 12000)',
    [ravitId, 3]
  );
  await conn.execute(
    'INSERT INTO ravitaillement_details (ravitaillement_id, produit_stock_id, quantite, prix) VALUES (?, ?, 15, 9000)',
    [ravitId, 4]
  );
  console.log('✅ Détails ravitaillement créés');

  // ============================================================
  // 13. SALAIRES
  // ============================================================
  // Serveur
  await conn.execute(
    'INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (?, "2025-05", 250000, "en attente", CURDATE())',
    [serveurId]
  );
  // 2e serveur (id = serveurId + 1)
  await conn.execute(
    'INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (?, "2025-05", 250000, "en attente", CURDATE())',
    [serveurId + 1]
  );
  // Cuisinier (id = serveurId + 2)
  await conn.execute(
    'INSERT INTO salaires (personnel_id, mois_annee, montant, statut, date_generation) VALUES (?, "2025-05", 350000, "en attente", CURDATE())',
    [serveurId + 2]
  );
  console.log('✅ Salaires créés (3 employés)');

  // ============================================================
  // 14. PRÉSENCES
  // ============================================================
  await conn.execute(
    `INSERT INTO presences (personnel_id, date_connexion, heure_connexion, date, statut, ip_address, session_id)
     VALUES (?, NOW() - INTERVAL 2 HOUR, CURTIME() - INTERVAL 2 HOUR, CURDATE(), "present", "127.0.0.1", "seed-session-001")`,
    [serveurId]
  );
  console.log('✅ Présence créée');

  // ============================================================
  // 15. IMPOSTS & TAXES
  // ============================================================
  await conn.execute(
    `INSERT INTO impots_taxes (libelle, montant, echeance, statut, created_at) VALUES ("Taxe municipale", 50000, CURDATE() + INTERVAL 30 DAY, "impaye", NOW())`
  );
  await conn.execute(
    `INSERT INTO impots_taxes (libelle, montant, echeance, statut, created_at) VALUES ("TVA", 25000, CURDATE() + INTERVAL 30 DAY, "impaye", NOW())`
  );
  console.log('✅ Impôts/taxes créés');

  // ============================================================
  // 16. CAMPAY SOLDE
  // ============================================================
  await conn.execute('INSERT INTO campay_solde (total_balance, orange_balance, mtn_balance, currency) VALUES (0, 0, 0, "XAF")');
  console.log('✅ Solde Campay initialisé');

  // ============================================================
  // 17. HISTORIQUE ACTIONS
  // ============================================================
  await conn.execute(
    `INSERT INTO historique_actions (utilisateur_id, action, ressource, ressource_id, details, ip_address)
     VALUES (1, "creation", "utilisateur", 1, "Compte admin créé lors de l'initialisation", "127.0.0.1")`
  );
  console.log('✅ Historique actions créé');

  // ============================================================
  // RÉSUMÉ
  // ============================================================
  console.log('\n=== RÉSUMÉ DES DONNÉES INSÉRÉES ===');

  const tableNames = [
    'utilisateurs', 'categories', 'produits_menu', 'produits_stock',
    'tables_salle', 'fournisseurs', 'commandes', 'commande_items',
    'paiements', 'transactions', 'mouvements_stock', 'inventaires',
    'ravitaillements', 'ravitaillement_details', 'salaires',
    'presences', 'impots_taxes', 'campay_solde', 'historique_actions'
  ];

  for (const table of tableNames) {
    const [rows] = await conn.execute(`SELECT COUNT(*) as c FROM ${table}`);
    console.log(`  ${table}: ${rows[0].c} ligne(s)`);
  }

  console.log('\n✅ Base de données initialisée avec succès !');
  await conn.end();
})().catch(e => { console.error(e); process.exit(1); });