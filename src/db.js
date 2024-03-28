const pgConfig = require('./config/pg.js');
const { Pool } = require('pg');
const { generateDocumentId, generateMemberId } = require('./helpers/ids');

const pool = new Pool({
  user: pgConfig.user,
  host: pgConfig.host,
  database: pgConfig.database,
  password: pgConfig.password,
  port: pgConfig.port
});


async function maFonction() {
    const result = await pool.query('SELECT * FROM giveaways where "guildId" = $1 and slug = $2', ['1205061903601369118', 'test']);
    console.log(result.rows);
    // Le reste de votre code...
}

maFonction();

