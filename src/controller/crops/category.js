const { connectToDatabase } = require("../../db.js");

async function getCropsByCategory(category) {
  try {
    const connection = await connectToDatabase();
    const result = await connection.execute(
      `SELECT CROPID, NAME, CATEGORY, PRICE, QUANTITY, SELLER_EMAIL FROM cropdata WHERE CATEGORY = :category AND QUANTITY != '0'`,
      { category }
    );
    await connection.close();
    return result.rows;
  } catch (error) {
    console.error("Error fetching crops by category:", error);
    throw error;
  }
}

module.exports = { getCropsByCategory };
