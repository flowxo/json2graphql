const { generate, sanitizeData } = require("./generateTables");
const { generateSql, runSql } = require("./sql");
const { cli } = require("cli-ux");
const { trackTables } = require("./track");
const { getInsertOrder, insertData } = require("./insert");
const { createRelationships } = require("./relationships");
const { createTables } = require("./check");

// const importData = async (jsonDb, url, headers, overwrite) => {
//   cli.action.start('Processing JSON data');
//   const db = sanitizeData(jsonDb);
//   const tables = generate(db);
//   const sql = generateSql(tables);
//   cli.action.stop('Done!');
//   cli.action.start('Checking database');
//   createTables(tables, url, headers, overwrite, runSql, sql).then(() => {
//     cli.action.stop('Done!');
//     cli.action.start('Tracking tables');
//     trackTables(tables, url, headers).then(() => {
//       cli.action.stop('Done!');
//       cli.action.start('Creating relationships');
//       createRelationships(tables, url, headers).then(() => {
//         cli.action.stop('Done!');
//         cli.action.start('Inserting data');
//         const insertOrder = getInsertOrder(tables);
//         insertData(insertOrder, db, tables, url, headers);
//       });
//     });
//   });
// };

function getSchema(tableName) {
  return ["authorization", "oauth_config", "account_identity"].includes(
    tableName
  )
    ? "flowxo_private"
    : "flowxo";
}

const importData = async (jsonDb, url, headers, overwrite) => {
  cli.action.start("Processing JSON data");
  const db = sanitizeData(jsonDb);
  const tables = generate(db);
  const sql = generateSql(tables);
  cli.action.stop("Done!");
  // cli.action.start("Checking database");
  trackTables(tables, url, headers, getSchema).then(() => {
    cli.action.stop("Done!");
    cli.action.start("Inserting data");
    const insertOrder = getInsertOrder(tables);
    insertData(insertOrder, db, tables, url, headers, getSchema);
  });
};

module.exports = importData;
