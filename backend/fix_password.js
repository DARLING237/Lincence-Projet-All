const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'barrestaurant_db'});
  const hash = '$2a$10$drdUXBfKtQMifphVdpX32e8ec0dg1X4C0c1AyyJxXuxHJcYX.NUhy';
  await conn.execute('UPDATE utilisateurs SET mot_de_passe=? WHERE id=1', [hash]);
  const [rows] = await conn.execute('SELECT id, email, mot_de_passe FROM utilisateurs WHERE id=1');
  console.log('Stored hash:', rows[0].mot_de_passe);
  console.log('Length:', rows[0].mot_de_passe.length);
  await conn.end();
})().catch(e => console.error(e));