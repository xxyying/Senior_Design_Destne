var fs = require('fs');

/*
Check for the settings.json file, if it doesn't exist suggest
decrypting the file that exists in the code repo
*/
var parsed;
try {
  parsed = JSON.parse(fs.readFileSync('./conf/settings.json', 'UTF-8'));
} catch (e) {
  console.error('Config file conf/settings.json missing');
  console.error('Did you forget to run `make decrypt_conf`?');
  process.exit(1);
}

//Make a connection for the User DB
var userKnex = require('knex')({
  client: 'mysql',
  connection: {
    host: parsed.db.host,
    user: parsed.db.user,
    password: parsed.db.password,
    database: parsed.db.databaseUsers,
    charset: parsed.db.charset
  }
});

var netflowKnex = require('knex')({
  client: 'mysql',
  connection: {
    host: parsed.db.host,
    user: parsed.db.user,
    password: parsed.db.password,
    database: parsed.db.databaseNetFlow,
    charset: parsed.db.charset
  }
});

var BookshelfUser = require('bookshelf')(userKnex);
var BookshelfNet = require('bookshelf')(netflowKnex);

module.exports.dbUser = BookshelfUser;
module.exports.dbNet = BookshelfNet;
