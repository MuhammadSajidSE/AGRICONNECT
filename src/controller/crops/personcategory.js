const { connectToDatabase } = require("../../db.js");

async function getPersonCategory(cropname, category) {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT c.CROPID, c.NAME, c.CATEGORY, c.QUANTITY, c.PRICE, s.NAME as SELLER_NAME, c.SELLER_EMAIL
     FROM cropdata c
     JOIN seller_data s ON c.SELLER_EMAIL = s.EMAIL
     WHERE LOWER(c.NAME) = LOWER(:1) AND LOWER(c.CATEGORY) = LOWER(:2)`,
    [cropname, category]
  );
  await connection.close();
  return result.rows;
}

module.exports = { getPersonCategory };