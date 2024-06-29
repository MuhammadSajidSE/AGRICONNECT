const oracledb = require("oracledb");

async function connectToDatabase() {
  const connection = await oracledb.getConnection({
    user: "sajid",
    password: "root",
    connectString: "localhost:1521/XE",
  });
  return connection;
}

module.exports = {
  connectToDatabase,
};
