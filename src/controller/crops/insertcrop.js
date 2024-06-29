const { connectToDatabase } = require("../../db.js");

async function checkCropExistence(name, price, seller_email) {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT name FROM cropdata WHERE name = :name AND price = :price AND seller_email = :seller_email`,
    { name, price, seller_email }
  );
  await connection.close();
  return result.rows;
}

async function getCropQuantity(name, price, seller_email) {
  const connection = await connectToDatabase();
  const result = await connection.execute(
    `SELECT quantity FROM cropdata WHERE name = :name AND price = :price AND seller_email = :seller_email`,
    { name, price, seller_email }
  );
  await connection.close();
  return result.rows[0] ? result.rows[0][0] : null;
}

async function insertCrop(sell_register) {
  const connection = await connectToDatabase();
  await connection.execute(
    `INSERT INTO cropdata (category, name, price, quantity, seller_email) 
     VALUES (:category, :name, :price, :quantity, :seller_email)`,
    sell_register
  );
  await connection.commit();
  await connection.close();
}

async function updateCropQuantity(name, price, seller_email, quantity) {
  const connection = await connectToDatabase();
  await connection.execute(
    `UPDATE cropdata SET quantity = :quantity 
     WHERE name = :name AND price = :price AND seller_email = :seller_email`,
    { quantity, name, price, seller_email }
  );
  await connection.commit();
  await connection.close();
}

module.exports = { checkCropExistence, getCropQuantity, insertCrop, updateCropQuantity };
