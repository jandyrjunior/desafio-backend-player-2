const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'player_2',
  password: 'jjunior1208',
  port: 5432
});

const query = (text, param) => {
  return pool.query(text, param);
}

module.exports = {
  query
}